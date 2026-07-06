import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Why this file exists: file upload concerns (where files land on disk,
// what types/sizes are allowed, how stored filenames are generated) are
// infrastructure details the controller shouldn't need to know about.
// The controller only ever sees req.files with paths already resolved.

const UPLOAD_DIR = path.resolve("uploads", "resumes");

// Created once at startup rather than on every request.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

// Files are written straight to disk with a generated name, never the
// client-supplied original filename — that avoids path-traversal issues
// (e.g. a filename like "../../server.js") and collisions between two
// candidates who both upload "resume.pdf".
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error("Only PDF and DOCX files are allowed"));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10, // max files per upload request
  },
});

export { UPLOAD_DIR };
