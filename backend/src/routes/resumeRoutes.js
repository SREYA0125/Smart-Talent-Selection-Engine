import express from "express";
import {
  uploadResumes,
  scoreJobCandidates,
  getRankedCandidates,
  toggleShortlist,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

router.post("/:jobId/upload", upload.array("resumes", 20), uploadResumes);
router.post("/:jobId/score", scoreJobCandidates);
router.get("/:jobId/rankings", getRankedCandidates);
router.patch("/candidate/:candidateId/shortlist", toggleShortlist);

export default router;
import express from "express";
import {
  uploadResumes,
  scoreJobCandidates,
  getRankedCandidates,
  toggleShortlist,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

router.post("/:jobId/upload", upload.array("resumes", 20), uploadResumes);
router.post("/:jobId/score", scoreJobCandidates);
router.get("/:jobId/rankings", getRankedCandidates);
router.patch("/candidate/:candidateId/shortlist", toggleShortlist);

export default router;
