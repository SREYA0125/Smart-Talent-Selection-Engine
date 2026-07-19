import express from "express";
import {
  getDashboardStats,
  getRecruiters,
  createRecruiter,
  updateRecruiter,
  deleteRecruiter,
  getJobs,
  getPlatformAnalytics,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";
import { ROLES } from "../constants/roles.js";

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
| Maps endpoints to adminController handlers. All routes are protected by
| JWT authentication and restricted to users with the ADMIN role.
|--------------------------------------------------------------------------
*/

const router = express.Router();

// Apply protection and authorization to all admin endpoints
router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/analytics", getPlatformAnalytics);

router.get("/recruiters", getRecruiters);
router.post("/recruiters", createRecruiter);
router.put("/recruiters/:id", updateRecruiter);
router.delete("/recruiters/:id", deleteRecruiter);

router.get("/jobs", getJobs);

export default router;
