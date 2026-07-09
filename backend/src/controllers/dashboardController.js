import { prisma } from "../config/prisma.js";
import { logger } from "../utils/logger.js";

/*
|--------------------------------------------------------------------------
| Dashboard Controller
|--------------------------------------------------------------------------
| Aggregates recruiter statistics into one response.
|--------------------------------------------------------------------------
*/

export const getDashboard = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    // ----------------------------------------------------
    // Total Jobs
    // ----------------------------------------------------

    const totalJobs = await prisma.job.count({
      where: {
        recruiterId,
      },
    });

    // ----------------------------------------------------
    // Total Resumes
    // ----------------------------------------------------

    const totalResumes = await prisma.resume.count({
      where: {
        job: {
          recruiterId,
        },
      },
    });

    // ----------------------------------------------------
    // Total AI Analyses
    // ----------------------------------------------------

    const totalAnalyses = await prisma.analysis.count({
      where: {
        job: {
          recruiterId,
        },
      },
    });

    // ----------------------------------------------------
    // Highest Score
    // ----------------------------------------------------

    const highestAnalysis =
      await prisma.analysis.findFirst({
        where: {
          job: {
            recruiterId,
          },
        },

        orderBy: {
          overallScore: "desc",
        },

        select: {
          overallScore: true,
        },
      });

          // ----------------------------------------------------
    // Top Candidate
    // ----------------------------------------------------

    const topCandidate = await prisma.analysis.findFirst({
      where: {
        job: {
          recruiterId,
        },
      },

      orderBy: {
        overallScore: "desc",
      },

      select: {
        overallScore: true,

        resume: {
          select: {
            id: true,
            originalName: true,
          },
        },
      },
    });

    // ----------------------------------------------------
    // Recent Jobs
    // ----------------------------------------------------

    const recentJobs = await prisma.job.findMany({
      where: {
        recruiterId,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 5,

      select: {
        id: true,
        title: true,
        createdAt: true,

        _count: {
          select: {
            resumes: true,
          },
        },
      },
    });

    // ----------------------------------------------------
    // Recent Candidates
    // ----------------------------------------------------

    const recentCandidates = await prisma.analysis.findMany({
      where: {
        job: {
          recruiterId,
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 5,

      select: {
        overallScore: true,
        summary: true,

        resume: {
          select: {
            id: true,
            originalName: true,
          },
        },
      },
    });

    return res.status(200).json({
  success: true,

  stats: {
    totalJobs,
    totalResumes,
    totalAnalyses,
    highestScore: highestAnalysis?.overallScore ?? 0,
  },

  topCandidate: topCandidate
    ? {
        resumeId: topCandidate.resume.id,
        candidateName: topCandidate.resume.originalName,
        overallScore: topCandidate.overallScore,
      }
    : null,

  recentJobs: recentJobs.map((job) => ({
    id: job.id,
    title: job.title,
    createdAt: job.createdAt,
    resumeCount: job._count.resumes,
  })),

  recentCandidates: recentCandidates.map((candidate) => ({
    resumeId: candidate.resume.id,
    candidateName: candidate.resume.originalName,
    overallScore: candidate.overallScore,
    summary: candidate.summary,
  })),
});

  } catch (err) {
    logger.error("Dashboard failed", {
      error: err.message,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard.",
    });
  }
};