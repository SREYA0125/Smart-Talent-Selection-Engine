import Button from "../common/Button";

/*
|--------------------------------------------------------------------------
| DeleteDialog
|--------------------------------------------------------------------------
| Why this file exists:
| - Displays a confirmation dialog before deleting a job.
| - Keeps confirmation UI separate from business logic.
| - Does not make API calls.
| - Parent (Jobs.jsx) decides what happens when Delete is confirmed.
|--------------------------------------------------------------------------
*/

export default function DeleteDialog({
  job,
  onConfirm,
  onCancel,
  deleting = false,
}) {
  return (
    <div className="space-y-6">
      {/* Message */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Delete Job
        </h3>

        <p className="mt-3 text-gray-600">
          Are you sure you want to permanently delete
          <span className="font-semibold"> "{job?.title}"</span>?
        </p>

        <p className="mt-2 text-sm text-red-500">
          This action cannot be undone.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={deleting}
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="danger"
          onClick={onConfirm}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}