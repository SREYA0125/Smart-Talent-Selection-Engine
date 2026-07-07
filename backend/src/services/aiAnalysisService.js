import OpenAI from "openai";
import { logger } from "../utils/logger.js";

// Groq's API is OpenAI-compatible, so the "openai" SDK is reused as-is —
// only baseURL and model name point at Groq instead of OpenAI.
// Free API key: https://console.groq.com/keys
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = "llama-3.3-70b-versatile";

// Distinct error type so the controller can tell "the AI call/response
// itself failed" apart from a database error or a not-found error, and map
// each to the right HTTP status without the service knowing about HTTP.
export class AIAnalysisError extends Error {
  constructor(message) {
    super(message);
    this.name = "AIAnalysisError";
  }
}

const REQUIRED_ARRAY_FIELDS = ["matchingSkills", "missingSkills", "strengths", "weaknesses"];

// Why this file exists: prompt engineering, the call to Groq, and validating
// what comes back are one cohesive concern — "turn a job + resume into a
// trustworthy structured analysis" — and none of it belongs in the
// controller. The controller should be able to call one function and get
// back either clean data or a clear error, with zero awareness of prompts,
// model names, or JSON-shape edge cases.
function buildPrompt({ jobTitle, jobDescription, resumeText }) {
  return `
You are a recruitment screening assistant. Compare the candidate's resume
against the job below and return ONLY valid JSON. Do not include markdown
formatting, code fences, explanations, or any text outside the JSON object.

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME TEXT (extracted from an uploaded PDF/DOCX, may be noisy):
${resumeText.slice(0, 8000)}

Return JSON in exactly this structure, with no additional keys:
{
  "overallScore": <integer 0-100>,
  "matchingSkills": [<skills from the job the candidate demonstrably has>],
  "missingSkills": [<important skills from the job the candidate appears to lack>],
  "strengths": [<2-4 short phrases on what makes this candidate strong for the role>],
  "weaknesses": [<2-4 short phrases on gaps or concerns relative to the role>],
  "summary": "<2-4 sentence overall explanation of the score>"
}
`.trim();
}

// Validates the AI's JSON against the exact contract this module promises
// its callers (and, eventually, the frontend). An LLM is not a type system —
// it can omit a field, return a string where an array was asked for, or
// return a score of 150. Trusting the raw response into the database would
// let a bad model output silently corrupt data or crash something reading
// it later. This function is the one place that enforces the shape.
function validateAndNormalize(parsed) {
  if (typeof parsed !== "object" || parsed === null) {
    throw new AIAnalysisError("AI response was not a JSON object");
  }

  const score = Number(parsed.overallScore);
  if (!Number.isFinite(score)) {
    throw new AIAnalysisError("AI response is missing a valid overallScore");
  }

  for (const field of REQUIRED_ARRAY_FIELDS) {
    if (!Array.isArray(parsed[field])) {
      throw new AIAnalysisError(`AI response field "${field}" is missing or not an array`);
    }
  }

  if (typeof parsed.summary !== "string" || !parsed.summary.trim()) {
    throw new AIAnalysisError("AI response is missing a valid summary");
  }

  return {
    overallScore: Math.max(0, Math.min(100, Math.round(score))),
    matchingSkills: parsed.matchingSkills.map(String),
    missingSkills: parsed.missingSkills.map(String),
    strengths: parsed.strengths.map(String),
    weaknesses: parsed.weaknesses.map(String),
    summary: parsed.summary.trim(),
  };
}

// The only function the controller calls. Everything above this line is a
// private implementation detail of "how" — the controller only needs "what".
export async function analyzeResumeAgainstJob({ jobTitle, jobDescription, resumeText }) {
  const prompt = buildPrompt({ jobTitle, jobDescription, resumeText });

  let response;
  try {
    response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });
  } catch (err) {
    // Covers network failures, timeouts, and Groq-side errors (rate limits,
    // invalid API key, model unavailable) uniformly — the controller
    // doesn't need to distinguish these, only that the AI call failed.
    logger.error("Groq API call failed", { error: err.message });
    throw new AIAnalysisError(`AI service call failed: ${err.message}`);
  }

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new AIAnalysisError("AI service returned an empty response");
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    logger.error("AI response was not valid JSON", { content: content.slice(0, 500) });
    throw new AIAnalysisError("AI service returned invalid JSON");
  }

  return validateAndNormalize(parsed);
}
