import { prisma } from "../config/prisma.js";
import { analyzeResumeAgainstJob, AIAnalysisError } from "../services/aiAnalysisService.js";
import { logger } from "../utils/logger.js";

// Shared ownership + precondition checks for both endpoints below. Returns
// { resume, job } on success, or sends the appropriate error response and
// returns null — the caller checks for null and returns immediately.
async function loadResumeForAnalysis(req, res) {
  const { resumeId } = req.params;

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: { job: true },
  });

  if (!resume) {
    res.status(404).json({ success: false, message: "Resume not found" });
    return null;
  }

  // Ownership is checked through the resume's own job, not a separate
  // jobId param — a resume unambiguously belongs to exactly one job
  // already (see Resume.jobId), so trusting a second, independently
  // supplied job id would just be a second source of truth to keep in sync.
  if (!resume.job || resume.job.recruiterId !== req.user.id) {
    res.status(404).json({ success: false, message: "Resume not found" });
    return null;
  }

  return { resume, job: resume.job };
}

// POST /api/analysis/:resumeId
// Runs AI analysis for one resume against the job it was uploaded for,
// and stores the result. Calling this again for a resume that already has
// an analysis replaces the existing one (re-analysis), rather than failing
// on the unique constraint — useful if the job description changes.
export const analyzeResume = async (req, res) => {
  try {
    const loaded = await loadResumeForAnalysis(req, res);
    if (!loaded) return;
    const { resume, job } = loaded;

    if (!resume.rawText || !resume.rawText.trim()) {
      return res.status(422).json({
        success: false,
        message: "This resume has no extracted text yet and cannot be analyzed",
      });
    }

    let result;
    try {
      result = await analyzeResumeAgainstJob({
        jobTitle: job.title,
        jobDescription: job.description,
        resumeText: resume.rawText,
      });
    } catch (err) {
      if (err instanceof AIAnalysisError) {
        logger.error("AI analysis failed", { resumeId: resume.id, jobId: job.id, error: err.message });
        return res.status(502).json({
          success: false,
          message: `AI analysis failed: ${err.message}`,
        });
      }
      throw err;
    }

    // upsert rather than create: a second analysis request for the same
    // resume (e.g. after the JD was edited) replaces the prior result
    // instead of erroring on Analysis.resumeId's unique constraint.
    const analysis = await prisma.analysis.upsert({
      where: { resumeId: resume.id },
      update: { ...result, jobId: job.id },
      create: { ...result, resumeId: resume.id, jobId: job.id },
    });

    return res.status(201).json({ success: true, analysis });
  } catch (err) {
    logger.error("Analyze resume failed", { error: err.message, resumeId: req.params.resumeId });
    return res.status(500).json({ success: false, message: "Server error while analyzing resume" });
  }
};

// GET /api/analysis/:resumeId
export const getAnalysis = async (req, res) => {
  try {
    const loaded = await loadResumeForAnalysis(req, res);
    if (!loaded) return;
    const { resume } = loaded;

    const analysis = await prisma.analysis.findUnique({ where: { resumeId: resume.id } });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "This resume has not been analyzed yet",
      });
    }

    return res.status(200).json({ success: true, analysis });
  } catch (err) {
    logger.error("Get analysis failed", { error: err.message, resumeId: req.params.resumeId });
    return res.status(500).json({ success: false, message: "Server error while fetching analysis" });
  }
};
