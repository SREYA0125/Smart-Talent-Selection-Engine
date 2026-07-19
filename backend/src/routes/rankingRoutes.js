import express from "express";
import { getRankings, exportRankings } from "../controllers/rankingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.use(protect);

router.get(
  "/:jobId/export",
  authorize(ROLES.ADMIN, ROLES.RECRUITER),
  exportRankings
);

router.get(
  "/:jobId",
  authorize(ROLES.ADMIN, ROLES.RECRUITER),
  getRankings
);

export default router;
