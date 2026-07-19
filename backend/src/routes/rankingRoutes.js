import express from "express";
import { getRankings } from "../controllers/rankingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.use(protect);
router.get(
  "/:jobId",
  authorize(ROLES.ADMIN, ROLES.RECRUITER),
  getRankings
);
router.get("/:jobId", getRankings);

export default router;
