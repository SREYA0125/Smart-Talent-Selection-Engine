import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import rankingRoutes from "./routes/rankingRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

// Loads variables from backend/.env into process.env. Called before
// anything else references process.env (PORT, DATABASE_URL, CLIENT_URL).
dotenv.config();

const app = express();

// Restricts which frontend origins may call this API. Falls back to "*"
// only if CLIENT_URL isn't set, which is fine for early local development
// but should always be a specific origin in any deployed environment.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

// Parses incoming JSON request bodies into req.body. Every future route
// that accepts a JSON payload (register, login, create job, etc.) depends
// on this middleware being registered before the routers.
app.use(express.json());

// Routes are mounted here, not defined here. server.js's only job is to
// wire together middleware + routers + startup sequencing — it stays
// readable as more routers (auth, jobs, resumes) are added module by module.
app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;

// The database connection is established before the server starts
// listening, so the app fails fast on a bad DATABASE_URL instead of
// starting up and only failing on the first request that touches the DB.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
