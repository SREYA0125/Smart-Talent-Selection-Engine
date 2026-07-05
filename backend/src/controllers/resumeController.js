import { prisma } from "../config/prisma.js";
import { extractTextFromFile, parseResume } from "../services/resumeParser.js";
import { scoreCandidate } from "../services/aiScoring.js";
import { upsertSkills } from "../services/skillService.js";
import { logger } from "../utils/logger.js";

// Shapes a Prisma Application (with nested skills + score) into the flat
// candidate object the frontend already renders — no frontend changes needed.
const formatCandidate = (application) => ({
  _id: application.id,
  fileName: application.fileName,
  name: application.name,
  email: application.email,
  phone: application.phone,
  skills: application.skills.map((s) => s.skill.name),
  education: application.education,
  experienceYears: application.experienceYears,
  shortlisted: application.shortlisted,
  score: application.score?.value ?? null,
  matchedSkills: application.score?.matchedSkills ?? [],
  missingSkills: application.score?.missingSkills ?? [],
  summary: application.score?.summary ?? "",
});

const applicationInclude = {
  skills: { include: { skill: true } },
  score: true,
};

export const uploadResumes = async (req, res, next) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.jobId, recruiterId: req.user.id },
    });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const results = [];

    for (const file of req.files) {
      try {
        const rawText = await extractTextFromFile(file.buffer, file.mimetype);
        const parsed = parseResume(rawText, file.originalname);
        const skills = await upsertSkills(parsed.skills);

        const application = await prisma.application.create({
          data: {
            jobId: job.id,
            fileName: file.originalname,
            rawText: parsed.rawText,
            name: parsed.name,
            email: parsed.email,
            phone: parsed.phone,
            education: parsed.education,
            experienceYears: parsed.experienceYears,
            skills: {
              create: skills.map((skill) => ({ skillId: skill.id })),
            },
          },
        });

        results.push({ fileName: file.originalname, status: "parsed", applicationId: application.id });
      } catch (err) {
        logger.error("Failed to parse resume", { file: file.originalname, error: err.message });
        results.push({ fileName: file.originalname, status: "failed", error: err.message });
      }
    }

    res.status(201).json({ success: true, results });
  } catch (err) {
    next(err);
  }
};

// Runs AI scoring for every un-scored application belonging to a job.
export const scoreJobCandidates = async (req, res, next) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.jobId, recruiterId: req.user.id },
      include: { requiredSkills: { include: { skill: true } } },
    });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const applications = await prisma.application.findMany({
      where: { jobId: job.id, score: null },
      include: { skills: { include: { skill: true } } },
    });

    const requiredSkillNames = job.requiredSkills.map((js) => js.skill.name);
    const scored = [];

    for (const application of applications) {
      try {
        const result = await scoreCandidate({
          jobTitle: job.title,
          jobDescription: job.description,
          requiredSkills: requiredSkillNames,
          candidate: {
            rawText: application.rawText,
            skills: application.skills.map((s) => s.skill.name),
            experienceYears: application.experienceYears,
          },
        });

        await prisma.score.create({
          data: {
            applicationId: application.id,
            value: result.score,
            matchedSkills: result.matchedSkills,
            missingSkills: result.missingSkills,
            summary: result.summary,
          },
        });

        scored.push({ applicationId: application.id, score: result.score });
      } catch (err) {
        logger.error("Scoring failed for application", { applicationId: application.id, error: err.message });
      }
    }

    res.json({ success: true, scoredCount: scored.length, scored });
  } catch (err) {
    next(err);
  }
};

// Ranked candidate list for a job, with optional filtering/sorting/search.
export const getRankedCandidates = async (req, res, next) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.jobId, recruiterId: req.user.id },
    });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const { search, minScore, shortlisted, sortBy = "score" } = req.query;

    const where = {
      jobId: job.id,
      ...(shortlisted === "true" ? { shortlisted: true } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { skills: { some: { skill: { name: { contains: search, mode: "insensitive" } } } } },
            ],
          }
        : {}),
      ...(minScore ? { score: { value: { gte: Number(minScore) } } } : {}),
    };

    const applications = await prisma.application.findMany({
      where,
      include: applicationInclude,
    });

    // Sorting on a nested relation (score.value) isn't expressible in a
    // single Prisma orderBy alongside these filters, so it's done in memory
    // — fine at MVP scale, would move to a raw query if this became a hot path.
    const sorted = applications.sort((a, b) => {
      if (sortBy === "experience") return b.experienceYears - a.experienceYears;
      const scoreA = a.score?.value ?? -1;
      const scoreB = b.score?.value ?? -1;
      return scoreB - scoreA;
    });

    res.json({ success: true, candidates: sorted.map(formatCandidate) });
  } catch (err) {
    next(err);
  }
};

export const toggleShortlist = async (req, res, next) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.candidateId },
      include: applicationInclude,
    });
    if (!application) return res.status(404).json({ success: false, message: "Candidate not found" });

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: { shortlisted: !application.shortlisted },
      include: applicationInclude,
    });

    res.json({ success: true, candidate: formatCandidate(updated) });
  } catch (err) {
    next(err);
  }
};
