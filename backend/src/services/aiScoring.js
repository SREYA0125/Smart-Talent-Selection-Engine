import OpenAI from "openai";

// Groq's API is OpenAI-compatible, so we reuse the same "openai" SDK —
// just point it at Groq's base URL and use a Groq model name.
// Free API key: https://console.groq.com/keys (no credit card required).
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = "llama-3.3-70b-versatile";

/**
 * Scores a single candidate against a job description using the LLM.
 * Returns { score, matchedSkills, missingSkills, summary }.
 *
 * Kept as one isolated function so the LLM provider can be swapped
 * (e.g. Anthropic, local model) without touching any calling code.
 */
export async function scoreCandidate({ jobTitle, jobDescription, requiredSkills, candidate }) {
  const prompt = `
You are a recruitment screening assistant. Compare the candidate against the job below
and return ONLY valid JSON, no markdown, no commentary.

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescription}

REQUIRED SKILLS: ${requiredSkills.join(", ") || "not specified"}

CANDIDATE RESUME TEXT (may be noisy, extracted from PDF/DOCX):
${candidate.rawText.slice(0, 6000)}

CANDIDATE EXTRACTED SKILLS: ${candidate.skills.join(", ") || "none detected"}
CANDIDATE EXPERIENCE (years, best guess): ${candidate.experienceYears}

Return JSON in exactly this shape:
{
  "score": <integer 0-100, how well this candidate matches the job>,
  "matchedSkills": [<skills from the job the candidate has>],
  "missingSkills": [<important skills from the job the candidate lacks>],
  "summary": "<2-3 sentence explanation of the score, mentioning specific strengths and gaps>"
}
`.trim();

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  const parsed = JSON.parse(content);

  return {
    score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
    matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
    summary: parsed.summary || "",
  };
}

/**
 * Uses the LLM to pull structured skills/keywords out of a raw JD.
 * Falls back to an empty list on failure so job creation never hard-fails.
 */
export async function extractJobSkills(jobDescription) {
  try {
    const prompt = `
Extract the key technical and soft skills required by this job description.
Return ONLY valid JSON: { "skills": ["skill1", "skill2", ...] }

JOB DESCRIPTION:
${jobDescription.slice(0, 4000)}
`.trim();

    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return Array.isArray(parsed.skills) ? parsed.skills : [];
  } catch (err) {
    return [];
  }
}
