import React from "react";

/*
|--------------------------------------------------------------------------
| Reusable Skeleton Screens Components
|--------------------------------------------------------------------------
| Loading placeholders that mimic visual layout structure while waiting for
| API responses. Uses Tailwind's animate-pulse.
|--------------------------------------------------------------------------
*/

export function DashboardStatSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="h-12 w-12 rounded-lg bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Alias mapping
export const DashboardCardSkeleton = DashboardStatSkeleton;

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="w-full border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex gap-4 justify-between">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/12" />
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="h-6 bg-gray-200 rounded w-16" />
            <div className="h-8 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between h-[380px] animate-pulse">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-6 w-6 rounded bg-gray-200" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
      </div>
      <div className="flex-1 flex items-end justify-between gap-4 px-2 h-48">
        {[60, 40, 80, 50, 70, 90].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <div style={{ height: `${h}%` }} className="w-full rounded bg-gray-200" />
            <div className="h-3 bg-gray-100 rounded w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  );
}

// Alias mapping
export const CardSkeleton = ProfileSkeleton;
