/*
|--------------------------------------------------------------------------
| UploadProgress
|--------------------------------------------------------------------------
| Responsibilities:
| - Display upload progress.
| - Shows a percentage and progress bar.
| - Pure UI component.
|--------------------------------------------------------------------------
*/

export default function UploadProgress({
  progress = 0,
  uploading = false,
}) {
  if (!uploading) return null;

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">
          Uploading Resumes
        </h3>

        <span className="font-medium text-accent">
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <p className="mt-3 text-sm text-gray-500">
        Please wait while your resumes are being uploaded...
      </p>
    </div>
  );
}