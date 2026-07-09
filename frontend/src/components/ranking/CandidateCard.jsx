import RankBadge from "./RankBadge";
import ScoreBadge from "../analysis/ScoreBadge";

export default function CandidateCard({ candidate }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition">

      <div className="flex justify-between items-center">

        <div className="flex items-center gap-4">

          <RankBadge rank={candidate.rank} />

          <div>

            <h2 className="text-xl font-semibold">
              {candidate.candidateName}
            </h2>

            <p className="text-gray-500 mt-1">
              Rank #{candidate.rank}
            </p>

          </div>

        </div>

        <ScoreBadge score={candidate.overallScore} />

      </div>

      <div className="mt-6">

        <h3 className="font-semibold mb-2">
          AI Summary
        </h3>

        <p className="text-gray-600 leading-7">
          {candidate.summary}
        </p>

      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">

        <div>

          <h3 className="font-semibold mb-2">
            Matching Skills
          </h3>

          <div className="flex flex-wrap gap-2">

            {candidate.matchingSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
              >
                {skill}
              </span>
            ))}

          </div>

        </div>

        <div>

          <h3 className="font-semibold mb-2">
            Missing Skills
          </h3>

          <div className="flex flex-wrap gap-2">

            {candidate.missingSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
              >
                {skill}
              </span>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}