import fs from "fs/promises";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

const PDF_MIME = "application/pdf";
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// A distinct error type for parsing failures specifically. This lets the
// controller (or anything else calling this service later) tell "this file
// could not be parsed" apart from an unrelated bug via a generic Error,
// without the service needing to know anything about HTTP status codes.
export class ResumeParsingError extends Error {
  constructor(message) {
    super(message);
    this.name = "ResumeParsingError";
  }
}

// Why this file exists: text extraction is a distinct concern from both
// "receiving an HTTP upload" (uploadMiddleware) and "deciding what to do
// with the result" (resumeController). Isolating it here means:
//  - the controller has no idea pdf-parse or mammoth exist
//  - swapping libraries later (e.g. a better PDF parser) touches one file
//  - this logic is trivially unit-testable in isolation, with no Express
//    request/response objects involved
export async function extractTextFromResume(filePath, mimeType) {
  if (mimeType === PDF_MIME) {
    return extractFromPdf(filePath);
  }
  if (mimeType === DOCX_MIME) {
    return extractFromDocx(filePath);
  }
  // Defense in depth: uploadMiddleware's fileFilter already rejects other
  // mime types before a file reaches disk, but the parser doesn't trust
  // that as its only guard — a caller invoking this service directly
  // (e.g. from a future re-parse endpoint) still gets a clear error.
  throw new ResumeParsingError(`Unsupported file type for parsing: ${mimeType}`);
}

async function extractFromPdf(filePath) {
  let buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch (err) {
    throw new ResumeParsingError(`Could not read uploaded file: ${err.message}`);
  }

  let result;
  try {
    result = await pdfParse(buffer);
  } catch (err) {
    // pdf-parse throws on malformed/corrupted PDFs (bad header, broken
    // xref table, encrypted content it can't handle, etc.) — surfaced as
    // a parsing error rather than a 500, since the file itself is at fault.
    throw new ResumeParsingError(`Corrupted or unreadable PDF: ${err.message}`);
  }

  const text = (result.text || "").trim();
  if (!text) {
    // A PDF that "parses" successfully but yields no text is usually a
    // scanned image with no OCR layer. That's a real, expected failure
    // mode for this MVP (no OCR support), not a bug — treated the same
    // way as any other parsing failure.
    throw new ResumeParsingError("PDF parsed but contained no extractable text (possibly a scanned image)");
  }

  return text;
}

async function extractFromDocx(filePath) {
  let result;
  try {
    result = await mammoth.extractRawText({ path: filePath });
  } catch (err) {
    throw new ResumeParsingError(`Corrupted or unreadable DOCX: ${err.message}`);
  }

  const text = (result.value || "").trim();
  if (!text) {
    throw new ResumeParsingError("DOCX parsed but contained no extractable text");
  }

  return text;
}
