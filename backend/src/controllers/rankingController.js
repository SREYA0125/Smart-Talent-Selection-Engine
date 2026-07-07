import { prisma } from "../config/prisma.js";
import { logger } from "../utils/logger.js";

// GET /api/ranking/:jobId
// Reads only what the AI Analysis module already stored — no Groq call
// happens here, ever. Ranking is purely a query + sort + reshape over
// existing PostgreSQL rows.
export const getRankings = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Ownership check happens first and is the only thing that returns 404
    // for "doesn't exist or isn't yours" — same reasoning as every other
    // module: a job belonging to another recruiter should be indistinguishable
    // from a job that doesn't exist at all.
    const job = await prisma.job.findFirst({
      where: { id: jobId, recruiterId: req.user.id },
      select: { id: true, title: true },
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Distinguishing "no resumes at all" from "resumes exist but none are
    // analyzed yet" requires knowing the resume count separately — without
    // this check, both cases would look identical (an empty rankings array)
    // and the recruiter would have no way to tell whether they need to
    // upload resumes or just run analysis on the ones they already uploaded.
    const resumeCount = await prisma.resume.count({ where: { jobId: job.id } });

    if (resumeCount === 0) {
      return res.status(200).json({
        success: true,
        job,
        candidateCount: 0,
        rankings: [],
        message: "No resumes have been uploaded for this job yet",
      });
    }

    // Sorting happens in the database via Prisma's orderBy, not in
    // application code after fetching everything into memory. This matters
    // for scalability: Postgres can sort using an index far more efficiently
    // than Node.js can sort an array that keeps growing as more candidates
    // are analyzed — the query stays fast at 50 resumes or 5,000.
    //
    // Multi-key sort: overallScore descending (best match first), and for
    // any tie, createdAt ascending — the candidate analyzed first keeps the
    // higher position, a stable and predictable tie-break rather than an
    // arbitrary one.
    const analyses = await prisma.analysis.findMany({
      where: { jobId: job.id },
      orderBy: [{ overallScore: "desc" }, { createdAt: "asc" }],
      select: {
        overallScore: true,
        summary: true,
        matchingSkills: true,
        missingSkills: true,
        resume: {
          select: { id: true, originalName: true },
        },
        // rawText and filePath are never selected here — not because they're
        // filtered out afterward, but because they're never fetched from the
        // database in the first place. Smaller queries, and no risk of ever
        // accidentally leaking them in a future change to this response.
      },
    });

    if (analyses.length === 0) {
      return res.status(200).json({
        success: true,
        job,
        candidateCount: 0,
        rankings: [],
        message: "Resumes have been uploaded but none have been analyzed yet",
      });
    }

    // Rank is computed here, on every request, from the current sort order —
    // it is never stored as a column. Storing a "rank" value on Analysis
    // would go stale the moment a new resume is analyzed or an existing one
    // is re-analyzed with a different score; computing it fresh from the
    // current data means it's always correct with no invalidation logic
    // needed anywhere.
    const rankings = analyses.map((analysis, index) => ({
      rank: index + 1,
      resumeId: analysis.resume.id,
      candidateName: analysis.resume.originalName,
      overallScore: analysis.overallScore,
      summary: analysis.summary,
      matchingSkills: analysis.matchingSkills,
      missingSkills: analysis.missingSkills,
    }));

    return res.status(200).json({
      success: true,
      job,
      candidateCount: rankings.length,
      rankings,
    });
  } catch (err) {
    logger.error("Get rankings failed", { error: err.message, jobId: req.params.jobId });
    return res.status(500).json({ success: false, message: "Server error while ranking candidates" });
  }
};
