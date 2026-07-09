import ScoreBadge from "./ScoreBadge";
import SkillList from "./SkillList";

/*
|--------------------------------------------------------------------------
| AnalysisCard
|--------------------------------------------------------------------------
| Responsibilities:
| - Display the complete AI analysis for a resume.
| - Pure presentation component.
| - Receives an analysis object and renders it.
|--------------------------------------------------------------------------
*/

export default function AnalysisCard({ analysis }) {
  if (!analysis) return null;

  return (
    <div className="space-y-6">

      {/* Overall Score */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">

          <h2 className="text-2xl font-bold text-gray-800">
            AI Resume Analysis
          </h2>

          <p className="mt-2 text-gray-500">
            Overall Candidate Score
          </p>

          <div className="mt-6">
            <ScoreBadge score={analysis.overallScore} />
          </div>

        </div>
      </div>

      {/* Skills */}

      <div className="grid gap-6 lg:grid-cols-2">

        <SkillList
          title="Matching Skills"
          skills={analysis.matchingSkills}
          variant="success"
        />

        <SkillList
          title="Missing Skills"
          skills={analysis.missingSkills}
          variant="danger"
        />

      </div>

      {/* Strengths */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <h3 className="mb-4 text-xl font-semibold">
          Strengths
        </h3>

        <ul className="list-disc space-y-2 pl-6 text-gray-700">
          {analysis.strengths.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

      </div>

      {/* Weaknesses */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <h3 className="mb-4 text-xl font-semibold">
          Weaknesses
        </h3>

        <ul className="list-disc space-y-2 pl-6 text-gray-700">
          {analysis.weaknesses.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

      </div>

      {/* Summary */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <h3 className="mb-4 text-xl font-semibold">
          AI Summary
        </h3>

        <p className="leading-7 text-gray-700">
          {analysis.summary}
        </p>

      </div>

    </div>
  );
}