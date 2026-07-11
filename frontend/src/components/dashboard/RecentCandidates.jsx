import { Brain } from "lucide-react";
import ScoreBadge from "../analysis/ScoreBadge";

/*
|--------------------------------------------------------------------------
| RecentCandidates
|--------------------------------------------------------------------------
| Responsibilities
|
| • Display the most recently analyzed candidates.
| • Show AI score and summary.
| • Display an empty state if no analyses exist.
|--------------------------------------------------------------------------
*/

export default function RecentCandidates({ candidates = [] }) {
  if (candidates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-8 text-center shadow-sm">
        <Brain
          size={48}
          className="mx-auto text-purple-500"
        />

        <h2 className="mt-4 text-xl font-semibold text-gray-800">
          No AI Analyses Yet
        </h2>

        <p className="mt-2 text-gray-500">
          Analyze resumes to see recent candidates here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      {/* Header */}

      <div className="mb-6 flex items-center gap-3">

        <Brain
          size={24}
          className="text-purple-600"
        />

        <h2 className="text-xl font-semibold text-gray-800">
          Recent Candidates
        </h2>

      </div>

      {/* Candidate List */}

      <div className="space-y-4">

        {candidates.map((candidate) => (
          <div
            key={candidate.resumeId}
            className="rounded-lg border p-4 transition hover:bg-gray-50"
          >

            <div className="flex items-center justify-between">

              <div>

                <h3 className="font-semibold text-gray-800">
                  {candidate.candidateName}
                </h3>

                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {candidate.summary}
                </p>

              </div>

              <ScoreBadge score={candidate.overallScore} />

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}