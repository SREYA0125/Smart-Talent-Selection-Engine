import express from "express";
import { uploadResumes, getResumesByJob } from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

// multer's errors (wrong file type, file too large, too many files) are
// passed to its own callback here instead of via next(err) + a global error
// handler. This keeps the upload-specific error response (400, clear
// message) colocated with the upload route rather than depending on
// error-handling middleware ordering elsewhere in the app.
const handleUpload = (req, res, next) => {
  upload.array("resumes", 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.post("/:jobId/upload", handleUpload, uploadResumes);
router.get("/:jobId", getResumesByJob);

export default router;
