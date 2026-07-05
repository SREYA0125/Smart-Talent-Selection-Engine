import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Applied once, above every route in this file, rather than repeated on
// each line — every job endpoint requires an authenticated recruiter,
// with no exceptions, so there's no risk of forgetting it on a new route.
router.use(protect);

router.post("/", createJob);
router.get("/", getJobs);
router.get("/:id", getJobById);
router.patch("/:id", updateJob);
router.delete("/:id", deleteJob);

export default router;
