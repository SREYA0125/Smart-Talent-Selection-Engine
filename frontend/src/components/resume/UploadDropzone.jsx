import { useRef } from "react";
import { UploadCloud, FileText } from "lucide-react";

/*
|--------------------------------------------------------------------------
| UploadDropzone
|--------------------------------------------------------------------------
| Responsibilities:
| - Drag & Drop files
| - Click to browse
| - Multiple PDF/DOCX support
| - Displays selected files
|
| This component NEVER uploads files.
| It only returns selected files to the parent.
|--------------------------------------------------------------------------
*/

export default function UploadDropzone({
  files,
  setFiles,
  disabled = false,
}) {
  const inputRef = useRef(null);

  const handleFiles = (selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter((file) => {
      return (
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
    });

    setFiles(validFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (disabled) return;

    handleFiles(e.dataTransfer.files);
  };

  const handleBrowse = (e) => {
    handleFiles(e.target.files);
  };

  return (
    <div className="space-y-5">
      {/* Hidden input */}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.docx"
        className="hidden"
        onChange={handleBrowse}
      />

      {/* Dropzone */}

      <div
        onClick={() => !disabled && inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition

        ${
          disabled
            ? "cursor-not-allowed bg-gray-100"
            : "hover:border-accent hover:bg-blue-50"
        }`}
      >
        <UploadCloud
          size={60}
          className="mx-auto text-accent"
        />

        <h2 className="mt-5 text-xl font-semibold">
          Drag & Drop Resumes
        </h2>

        <p className="mt-2 text-gray-500">
          PDF or DOCX • Multiple files supported
        </p>

        <button
          type="button"
          className="mt-6 rounded-lg bg-accent px-5 py-2 text-white hover:opacity-90"
        >
          Choose Files
        </button>
      </div>

      {/* Selected Files */}

      {files.length > 0 && (
        <div className="space-y-3 rounded-lg border bg-white p-4">
          <h3 className="font-semibold">
            Selected Files
          </h3>

          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-accent" />

                <div>
                  <p className="font-medium">
                    {file.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}