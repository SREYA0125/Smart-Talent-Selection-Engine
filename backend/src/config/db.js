
import { prisma } from "./prisma.js";

// Why this file exists: server.js shouldn't know *how* the database is
// connected or verified, only that it needs to happen before the app starts
// accepting traffic. This function is the single entry point for that.
//
// connectDB() is called once at boot (see server.js) to fail fast if the
// database is unreachable, rather than letting the app start and only
// discovering the problem on the first incoming request.
export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected (via Prisma)");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
};

// Why this exists separately from connectDB(): connecting once at boot only
// proves the database was reachable *at startup*. The /health endpoint needs
// to check connectivity live, on every call — this runs a trivial query
// against Postgres and reports true/false without throwing, so the route
// handler can build its response either way.
export const isDatabaseConnected = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    console.error("Database health check failed:", err.message);
    return false;
  }
};
