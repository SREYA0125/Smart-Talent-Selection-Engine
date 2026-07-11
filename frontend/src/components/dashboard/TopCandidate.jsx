import { Trophy, Star } from "lucide-react";
import ScoreBadge from "../analysis/ScoreBadge";

/*
|--------------------------------------------------------------------------
| TopCandidate
|--------------------------------------------------------------------------
| Responsibilities
|
| • Display the highest-ranked candidate.
| • Highlight the AI score.
| • Show an empty state if no analyses exist.
|--------------------------------------------------------------------------
*/

export default function TopCandidate({ candidate }) {
  if (!candidate) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-8 text-center shadow-sm">
        <Trophy
          size={48}
          className="mx-auto text-yellow-500"
        />

        <h2 className="mt-4 text-xl font-semibold text-gray-800">
          No Top Candidate Yet
        </h2>

        <p className="mt-2 text-gray-500">
          Analyze resumes to discover your best candidate.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="rounded-full bg-yellow-100 p-3">
            <Trophy
              size={28}
              className="text-yellow-600"
            />
          </div>

          <div>

            <h2 className="text-xl font-semibold text-gray-800">
              Top Candidate
            </h2>

            <p className="text-gray-500">
              Highest AI Score
            </p>

          </div>

        </div>

        <ScoreBadge score={candidate.overallScore} />

      </div>

      <div className="mt-6 border-t pt-6">

        <h3 className="text-lg font-semibold text-gray-800">
          {candidate.candidateName}
        </h3>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
          <Star size={16} />
          Recommended Candidate
        </div>

      </div>
    </div>
  );
}