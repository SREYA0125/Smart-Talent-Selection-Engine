import { X } from "lucide-react";

/*
|--------------------------------------------------------------------------
| Modal Component
|--------------------------------------------------------------------------
| Why this file exists:
| - A reusable modal dialog for the entire application.
| - Keeps modal logic out of individual pages.
| - Can be reused for Job creation, editing, delete confirmation,
|   resume uploads, candidate details, etc.
|--------------------------------------------------------------------------
*/

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "max-w-lg",
}) {
  // Don't render anything when closed.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      {/* Modal Box */}
      <div
        className={`w-full ${size} rounded-xl bg-white shadow-2xl animate-fade-in`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}