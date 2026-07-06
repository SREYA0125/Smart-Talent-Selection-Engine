import fs from "fs";
import { prisma } from "../config/prisma.js";
import { logger } from "../utils/logger.js";

// POST /api/resumes/:jobId/upload
// Stores file metadata only. The actual text extraction (PDF/DOCX parsing)
// happens in the Resume Parsing module — this endpoint's only job is to
// accept files, validate them, and record where they live.
export const uploadResumes = async (req, res) => {

  console.log("========== DEBUG ==========");
console.log("Headers:", req.headers["content-type"]);
console.log("req.files:", req.files);
console.log("req.body:", req.body);
console.log("===========================");

  try {
    const { jobId } = req.params;

    // Ownership check: a recruiter can only upload resumes against their
    // own job. Multer has already written the files to disk by this point
    // (it runs before this handler), so on a failed ownership check they're
    // cleaned up rather than left as orphaned files with no DB record.
    const job = await prisma.job.findFirst({
      where: { id: jobId, recruiterId: req.user.id },
    });

    if (!job) {
      if (req.files) {
        req.files.forEach((file) => fs.unlink(file.path, () => {}));
      }
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const resumes = await prisma.$transaction(
      req.files.map((file) =>
        prisma.resume.create({
          data: {
            jobId: job.id,
            originalName: file.originalname,
            storedName: file.filename,
            filePath: file.path,
            mimeType: file.mimetype,
            fileSize: file.size,
          },
        })
      )
    );

    return res.status(201).json({ success: true, count: resumes.length, resumes });
  } catch (err) {
    logger.error("Resume upload failed", { error: err.message, jobId: req.params.jobId });
    return res.status(500).json({ success: false, message: "Server error while uploading resumes" });
  }
};

// GET /api/resumes/:jobId
// Lists uploaded resumes for a job. Included so this module can be tested
// end-to-end (confirm what got stored) without needing the parsing or
// scoring modules to exist yet.
export const getResumesByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findFirst({
      where: { id: jobId, recruiterId: req.user.id },
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const resumes = await prisma.resume.findMany({
      where: { jobId: job.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, count: resumes.length, resumes });
  } catch (err) {
    logger.error("Get resumes failed", { error: err.message, jobId: req.params.jobId });
    return res.status(500).json({ success: false, message: "Server error while fetching resumes" });
  }
};
