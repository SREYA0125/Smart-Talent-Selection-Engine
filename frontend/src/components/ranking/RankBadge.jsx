/*
|--------------------------------------------------------------------------
| RankBadge
|--------------------------------------------------------------------------
| Displays candidate rank.
|--------------------------------------------------------------------------
*/

export default function RankBadge({ rank }) {
  const styles = {
    1: "bg-yellow-400 text-white",
    2: "bg-gray-400 text-white",
    3: "bg-orange-500 text-white",
  };

  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-full font-bold text-lg ${
        styles[rank] || "bg-blue-600 text-white"
      }`}
    >
      #{rank}
    </div>
  );
}