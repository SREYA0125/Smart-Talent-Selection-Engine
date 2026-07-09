import CandidateCard from "./CandidateCard";

export default function RankingList({ candidates }) {
  if (candidates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center bg-white">
        <h2 className="text-xl font-semibold">
          No analyzed candidates yet
        </h2>

        <p className="text-gray-500 mt-2">
          Analyze resumes to generate rankings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.resumeId}
          candidate={candidate}
        />
      ))}
    </div>
  );
}