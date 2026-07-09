import { FileText, CalendarDays, HardDrive } from "lucide-react";

/*
|--------------------------------------------------------------------------
| ResumeCard
|--------------------------------------------------------------------------
| Responsibilities:
| - Displays a single uploaded resume.
| - Pure UI component.
| - No API calls.
| - Designed to grow with future modules (AI Analysis, Download, etc.).
|--------------------------------------------------------------------------
*/

export default function ResumeCard({ resume }) {
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* Resume Name */}
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-blue-100 p-3">
          <FileText className="text-accent" size={24} />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 break-all">
            {resume.originalName}
          </h3>

          <p className="mt-1 text-sm text-green-600">
            Uploaded Successfully
          </p>
        </div>
      </div>

      {/* Resume Info */}
      <div className="mt-5 space-y-3 text-sm text-gray-600">

        <div className="flex items-center gap-2">
          <CalendarDays size={16} />
          <span>
            {new Date(resume.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <HardDrive size={16} />
          <span>{formatFileSize(resume.fileSize)}</span>
        </div>

      </div>
    </div>
  );
}