import fs from "fs";
import { prisma } from "../config/prisma.js";
import { extractTextFromResume } from "../services/resumeParser.js";
import { logger } from "../utils/logger.js";

// Excludes rawText from list responses by default — resume text can be
// several KB per file, and nothing in this module's list view needs it.
// The same reasoning as excluding a password hash from a user object:
// don't return a large/sensitive field the caller didn't ask for.
const RESUME_LIST_SELECT = {
  id: true,
  originalName: true,
  storedName: true,
  mimeType: true,
  fileSize: true,
  createdAt: true,
  rawText: false,
};

// POST /api/resumes/:jobId/upload
// Upload, parse, and store extracted text — all in one request, as required.
// Each file is handled independently: one corrupted file in a batch of ten
// does not fail the other nine.
export const uploadResumes = async (req, res) => {
  try {
    const { jobId } = req.params;

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

    const uploaded = [];
    const failed = [];

    for (const file of req.files) {
      try {
        // Parsing happens BEFORE the database write, and the Resume row is
        // created in a single prisma.resume.create call that already
        // includes rawText. This is the key design decision in this module:
        // there is no intermediate state where a Resume row exists with
        // rawText still empty — either parsing succeeds and a complete
        // record is written, or it fails and nothing is written at all.
        // A two-step "create then update with parsed text" approach would
        // leave exactly that inconsistent half-written row if the process
        // crashed between the two writes.
        const rawText = await extractTextFromResume(file.path, file.mimetype);

        const resume = await prisma.resume.create({
          data: {
            jobId: job.id,
            originalName: file.originalname,
            storedName: file.filename,
            filePath: file.path,
            mimeType: file.mimetype,
            fileSize: file.size,
            rawText,
          },
        });

        uploaded.push(resume);
      } catch (err) {
        // A file that fails to parse is not useful to keep on disk — it has
        // no database record pointing to it and never will, so it would
        // otherwise become an orphaned file consuming storage indefinitely.
        logger.error("Resume parsing failed", {
          file: file.originalname,
          jobId: job.id,
          error: err.message,
        });
        fs.unlink(file.path, () => {});
        failed.push({ fileName: file.originalname, error: err.message });
      }
    }

    // 201 if at least one file made it all the way through; 400 if the
    // entire batch failed to parse. Either way, both lists are returned so
    // the caller can see exactly what succeeded and what didn't per file —
    // useful when uploading many resumes at once.
    const statusCode = uploaded.length > 0 ? 201 : 400;

    return res.status(statusCode).json({
      success: uploaded.length > 0,
      uploadedCount: uploaded.length,
      failedCount: failed.length,
      resumes: uploaded,
      failed,
    });
  } catch (err) {
    logger.error("Resume upload failed", { error: err.message, jobId: req.params.jobId });
    return res.status(500).json({ success: false, message: "Server error while uploading resumes" });
  }
};

// GET /api/resumes/:jobId
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
      select: RESUME_LIST_SELECT,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, count: resumes.length, resumes });
  } catch (err) {
    logger.error("Get resumes failed", { error: err.message, jobId: req.params.jobId });
    return res.status(500).json({ success: false, message: "Server error while fetching resumes" });
  }
};
