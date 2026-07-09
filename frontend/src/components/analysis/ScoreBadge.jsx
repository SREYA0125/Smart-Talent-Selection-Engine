/*
|--------------------------------------------------------------------------
| ScoreBadge
|--------------------------------------------------------------------------
| Responsibilities:
| - Display the AI overall score.
| - Color changes based on score.
| - Reusable anywhere scores are displayed.
|--------------------------------------------------------------------------
*/

export default function ScoreBadge({ score }) {
  const getBadgeStyle = () => {
    if (score >= 80) {
      return "bg-green-100 text-green-700 border-green-300";
    }

    if (score >= 60) {
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }

    return "bg-red-100 text-red-700 border-red-300";
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full border px-5 py-2 text-lg font-bold ${getBadgeStyle()}`}
    >
      {score}/100
    </div>
  );
}