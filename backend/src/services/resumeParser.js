import pdfParse from "pdf-parse";
import mammoth from "mammoth";

// Common tech/skill keywords to scan for. Extend this list as needed —
// for the MVP a keyword pass is far cheaper and more predictable than
// asking the LLM to extract every field.
const SKILL_KEYWORDS = [
  "javascript", "typescript", "python", "java", "c++", "c#", "node.js", "node",
  "react", "redux", "vue", "angular", "next.js", "express", "django", "flask",
  "spring", "mongodb", "mysql", "postgresql", "sql", "aws", "azure", "gcp",
  "docker", "kubernetes", "git", "html", "css", "tailwind", "graphql",
  "rest api", "microservices", "machine learning", "deep learning",
  "tensorflow", "pytorch", "nlp", "data analysis", "excel", "power bi",
  "tableau", "agile", "scrum", "figma", "ci/cd", "jenkins", "linux",
];

const EDUCATION_KEYWORDS = [
  "b.tech", "btech", "b.e", "bachelor", "m.tech", "mtech", "master",
  "mba", "bca", "mca", "phd", "diploma", "b.sc", "m.sc",
];

export async function extractTextFromFile(buffer, mimetype) {
  if (mimetype === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error("Unsupported file type");
}

export function extractEmail(text) {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : "";
}

export function extractPhone(text) {
  const match = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{3,4}/);
  return match ? match[0].trim() : "";
}

export function extractSkills(text) {
  const lower = text.toLowerCase();
  return SKILL_KEYWORDS.filter((skill) => lower.includes(skill));
}

export function extractEducation(text) {
  const lower = text.toLowerCase();
  return EDUCATION_KEYWORDS.filter((keyword) => lower.includes(keyword));
}

export function extractExperienceYears(text) {
  // Looks for patterns like "3 years", "5+ years of experience"
  const matches = [...text.matchAll(/(\d+)\+?\s*years?/gi)];
  if (matches.length === 0) return 0;
  const years = matches.map((m) => parseInt(m[1], 10)).filter((n) => n < 50);
  return years.length ? Math.max(...years) : 0;
}

export function guessName(text, fileName) {
  // Best-effort: first non-empty line that looks like a name (2-4 words, no digits/@)
  const firstLines = text.split("\n").slice(0, 5);
  for (const line of firstLines) {
    const trimmed = line.trim();
    const words = trimmed.split(/\s+/);
    if (
      trimmed.length > 0 &&
      words.length >= 2 &&
      words.length <= 4 &&
      !/[\d@]/.test(trimmed)
    ) {
      return trimmed;
    }
  }
  return fileName.replace(/\.(pdf|docx)$/i, "");
}

export function parseResume(rawText, fileName) {
  return {
    rawText,
    name: guessName(rawText, fileName),
    email: extractEmail(rawText),
    phone: extractPhone(rawText),
    skills: extractSkills(rawText),
    education: extractEducation(rawText),
    experienceYears: extractExperienceYears(rawText),
  };
}
