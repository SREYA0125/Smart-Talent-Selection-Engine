import express from "express";
import {
  uploadResumes,
  getResumesByJob,
} from "../controllers/resumeController.js";

import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { authorize } from "../middleware/authorize.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

// Authentication first
router.use(protect);

// Then authorization
router.use(authorize(ROLES.RECRUITER));

// multer's errors (wrong file type, file too large, too many files) are
// handled here instead of a global error handler.
const handleUpload = (req, res, next) => {
  upload.array("resumes", 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    next();
  });
};

router.post("/:jobId/upload", handleUpload, uploadResumes);

router.get("/:jobId", getResumesByJob);

export default router;