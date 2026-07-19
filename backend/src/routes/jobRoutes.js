import { authorize } from "../middleware/authorize.js";
import { ROLES } from "../constants/roles.js";

import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobReport,
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Applied once, above every route in this file, rather than repeated on
// each line — every job endpoint requires an authenticated recruiter,
// with no exceptions, so there's no risk of forgetting it on a new route.
router.use(protect);

router.get("/", authorize(ROLES.ADMIN, ROLES.RECRUITER), getJobs);

router.get("/:id", authorize(ROLES.ADMIN, ROLES.RECRUITER), getJobById);

router.post("/", authorize(ROLES.RECRUITER), createJob);

router.patch("/:id", authorize(ROLES.RECRUITER), updateJob);

router.delete("/:id", authorize(ROLES.RECRUITER), deleteJob);

router.get("/:id/report", authorize(ROLES.RECRUITER, ROLES.ADMIN), getJobReport);

export default router;
