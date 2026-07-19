import { prisma } from "../config/prisma.js";
import { logger } from "../utils/logger.js";

const ALLOWED_STATUSES = ["OPEN", "CLOSED"];

// POST /api/jobs
export const createJob = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }

    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        recruiterId: req.user.id,
      },
    });

    return res.status(201).json({ success: true, job });
  } catch (err) {
    logger.error("Create job failed", { error: err.message });
    return res.status(500).json({ success: false, message: "Server error while creating job" });
  }
};

// GET /api/jobs
// Returns jobs owned by the logged-in recruiter.
// Supports query parameters: search, status, sort, page, limit.
export const getJobs = async (req, res) => {
  try {
    const { search, status, sort, page, limit } = req.query;

    const where = { recruiterId: req.user.id };

    if (status && ["OPEN", "CLOSED"].includes(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Sort mapping
    let orderBy = { createdAt: "desc" };
    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sort === "alphabetical") {
      orderBy = { title: "asc" };
    }

    const totalItems = await prisma.job.count({ where });

    let jobs;
    let pageNum = null;
    let limitNum = null;
    let totalPages = null;

    if (page || limit) {
      pageNum = parseInt(page, 10) || 1;
      limitNum = parseInt(limit, 10) || 10;
      const skip = (pageNum - 1) * limitNum;
      
      jobs = await prisma.job.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          _count: {
            select: {
              resumes: true,
            },
          },
        },
      });
      totalPages = Math.ceil(totalItems / limitNum);
    } else {
      jobs = await prisma.job.findMany({
        where,
        orderBy,
        include: {
          _count: {
            select: {
              resumes: true,
            },
          },
        },
      });
    }

    // Format the response keeping both 'jobs' and 'items' for compatibility
    const formattedJobs = jobs.map((job) => ({
      ...job,
      resumeCount: job._count?.resumes ?? 0,
    }));

    return res.status(200).json({
      success: true,
      count: formattedJobs.length,
      jobs: formattedJobs,
      items: formattedJobs,
      totalItems,
      currentPage: pageNum,
      totalPages: totalPages,
    });
  } catch (err) {
    logger.error("Get jobs failed", { error: err.message });
    return res.status(500).json({ success: false, message: "Server error while fetching jobs" });
  }
};

// GET /api/jobs/:id
export const getJobById = async (req, res) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.id, recruiterId: req.user.id },
    });

    // findFirst (not findUnique) with recruiterId in the where clause means
    // a job that exists but belongs to a different recruiter returns null
    // here too — indistinguishable from "doesn't exist". That's intentional:
    // it avoids leaking which job IDs exist to a recruiter who doesn't own them.
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    return res.status(200).json({ success: true, job });
  } catch (err) {
    logger.error("Get job by id failed", { error: err.message, jobId: req.params.id });
    return res.status(500).json({ success: false, message: "Server error while fetching job" });
  }
};

// PATCH /api/jobs/:id
export const updateJob = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (title === undefined && description === undefined && status === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update: title, description, or status",
      });
    }

    if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    // Ownership is checked explicitly before the update, rather than relying
    // on prisma.job.update's where clause alone, so a job belonging to
    // another recruiter returns a clean 404 instead of a Prisma "record not
    // found" error.
    const existingJob = await prisma.job.findFirst({
      where: { id: req.params.id, recruiterId: req.user.id },
    });

    if (!existingJob) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const job = await prisma.job.update({
      where: { id: existingJob.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(status !== undefined && { status }),
      },
    });

    return res.status(200).json({ success: true, job });
  } catch (err) {
    logger.error("Update job failed", { error: err.message, jobId: req.params.id });
    return res.status(500).json({ success: false, message: "Server error while updating job" });
  }
};

// DELETE /api/jobs/:id
export const deleteJob = async (req, res) => {
  try {
    const existingJob = await prisma.job.findFirst({
      where: { id: req.params.id, recruiterId: req.user.id },
    });

    if (!existingJob) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    await prisma.job.delete({ where: { id: existingJob.id } });

    return res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (err) {
    logger.error("Delete job failed", { error: err.message, jobId: req.params.id });
    return res.status(500).json({ success: false, message: "Server error while deleting job" });
  }
};

// GET /api/jobs/:id/report
export const getJobReport = async (req, res) => {
  try {
    const { id } = req.params;

    const jobQuery = { id };
    if (req.user.role !== "ADMIN") {
      jobQuery.recruiterId = req.user.id;
    }

    const job = await prisma.job.findFirst({
      where: jobQuery,
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Aggregate analysis scores
    const stats = await prisma.analysis.aggregate({
      where: { jobId: job.id },
      _count: { id: true },
      _avg: { overallScore: true },
      _max: { overallScore: true },
      _min: { overallScore: true },
    });

    const totalApplicants = stats._count.id || 0;
    const averageScore = stats._avg.overallScore ? Math.round(stats._avg.overallScore) : 0;
    const highestScore = stats._max.overallScore || 0;
    const lowestScore = stats._min.overallScore || 0;

    const excellentCandidates = await prisma.analysis.count({
      where: { jobId: job.id, overallScore: { gte: 90 } },
    });

    const goodCandidates = await prisma.analysis.count({
      where: { jobId: job.id, overallScore: { gte: 80, lte: 89 } },
    });

    const averageCandidates = await prisma.analysis.count({
      where: { jobId: job.id, overallScore: { gte: 70, lte: 79 } },
    });

    return res.status(200).json({
      success: true,
      report: {
        jobTitle: job.title,
        totalApplicants,
        averageMatchScore: averageScore,
        highestMatchScore: highestScore,
        lowestMatchScore: lowestScore,
        excellentCandidates,
        goodCandidates,
        averageCandidates,
      },
    });
  } catch (err) {
    logger.error("Get job report failed", { error: err.message, jobId: req.params.id });
    return res.status(500).json({ success: false, message: "Server error while generating job report" });
  }
};
