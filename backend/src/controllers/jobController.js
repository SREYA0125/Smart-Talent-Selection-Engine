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
// Returns only jobs owned by the logged-in recruiter — never all jobs in
// the system. req.user.id comes from the verified JWT via the auth
// middleware, not from any client-supplied input, so it can't be spoofed.
export const getJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { recruiterId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, count: jobs.length, jobs });
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
