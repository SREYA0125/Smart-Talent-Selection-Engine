import React from "react";

/*
|--------------------------------------------------------------------------
| StatCard
|--------------------------------------------------------------------------
| Responsibilities
|
| • Display one dashboard statistic.
| • Reusable for Jobs, Resumes, Analyses and Highest Score.
|--------------------------------------------------------------------------
*/

function StatCard({
  title,
  value,
  icon,
  color = "bg-blue-500",
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold text-gray-800">
            {value}
          </h2>

        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${color}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

export default React.memo(StatCard);