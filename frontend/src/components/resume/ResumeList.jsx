import ResumeCard from "./ResumeCard";

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
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <h2 className="text-xl font-semibold text-gray-700">
          No resumes uploaded yet
        </h2>

        <p className="mt-2 text-gray-500">
          Upload PDF or DOCX resumes to begin candidate analysis.
        </p>
      </div>
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