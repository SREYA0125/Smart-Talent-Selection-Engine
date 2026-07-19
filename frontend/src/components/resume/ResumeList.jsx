import ResumeCard from "./ResumeCard";
import EmptyState from "../common/EmptyState";
import { FileText } from "lucide-react";

/*
|--------------------------------------------------------------------------
| ResumeList
|--------------------------------------------------------------------------
| Responsibilities:
| - Render all uploaded resumes.
| - Display a friendly empty state.
| - Keep Resumes.jsx clean.
|--------------------------------------------------------------------------
*/

export default function ResumeList({ resumes = [] }) {
  // Empty State
  if (resumes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No resumes uploaded yet"
        description="Upload PDF or DOCX resumes to begin candidate analysis."
      />
    );
  }

  return (
    <div className="space-y-5">
      {resumes.map((resume) => (
        <ResumeCard
          key={resume.id}
          resume={resume}
        />
      ))}
    </div>
  );
}