import { Eye, Pencil, Trash2, CalendarDays } from "lucide-react";
import Card from "../common/Card";

/*
|--------------------------------------------------------------------------
| JobCard
|--------------------------------------------------------------------------
| Why this file exists:
| - Displays a single job in a clean card.
| - Pure presentation component.
| - Contains NO API calls.
| - All actions are delegated to the parent (Jobs.jsx).
|--------------------------------------------------------------------------
*/

export default function JobCard({
  job,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <Card className="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {job.title}
          </h2>

          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              job.status === "OPEN"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {job.status}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 text-gray-600">
        {job.description}
      </p>

      {/* Footer */}
      <div className="mt-6 flex flex-col gap-4 border-t pt-4 md:flex-row md:items-center md:justify-between">
        {/* Created Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarDays size={16} />
          <span>
            Created:{" "}
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(job)}
            className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
          >
            <Eye size={16} />
            View
          </button>

          <button
            onClick={() => onEdit(job)}
            className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-700 transition hover:bg-yellow-100"
          >
            <Pencil size={16} />
            Edit
          </button>

          <button
            onClick={() => onDelete(job)}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </Card>
  );
}