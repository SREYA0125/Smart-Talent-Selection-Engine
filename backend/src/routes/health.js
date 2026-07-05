import express from "express";
import { isDatabaseConnected } from "../config/db.js";

// Why this file exists: a dedicated router for infrastructure/ops concerns,
// kept separate from any future feature routers (jobRoutes, resumeRoutes,
// etc.). It has no dependency on auth, controllers, or business logic —
// intentionally, since load balancers, uptime monitors, and container
// orchestrators (Render, Docker, Kubernetes) hit this endpoint constantly
// and it must stay simple and fast.
const router = express.Router();

router.get("/", async (req, res) => {
  const connected = await isDatabaseConnected();

  res.status(connected ? 200 : 503).json({
    status: connected ? "OK" : "ERROR",
    database: connected ? "Connected" : "Disconnected",
  });
});

export default router;
