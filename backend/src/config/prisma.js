import { PrismaClient } from "@prisma/client";

// Single shared PrismaClient instance for the entire app.
//
// Why this file exists: PrismaClient manages its own internal connection
// pool. Creating a new instance per request (or per file that needs it)
// opens a new pool each time and will exhaust Postgres's max_connections
// under load. Every other file in the app imports `prisma` from here
// instead of instantiating its own client.
export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "warn", "error"]
      : ["warn", "error"],
});
