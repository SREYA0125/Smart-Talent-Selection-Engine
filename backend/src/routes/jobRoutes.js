import express from "express";
import { createJob, getJobs, getJobById, deleteJob } from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createJob);
router.get("/", getJobs);
router.get("/:id", getJobById);
router.delete("/:id", deleteJob);

export default router;
