import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/*
|--------------------------------------------------------------------------
| Modal Component
|--------------------------------------------------------------------------
| Why this file exists:
| - A reusable modal dialog for the entire application.
| - Keeps modal logic out of individual pages.
| - Fully accessible: supports escape key close, keyboard focus trapping,
|   focus restoration, and screen-reader ARIA attributes.
|--------------------------------------------------------------------------
*/

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "max-w-lg",
}) {
  const modalBoxRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Handle Escape key to close the modal
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Save previous active focus state
    const previousFocusedElement = document.activeElement;

    // Move focus inside the modal box
    if (modalBoxRef.current) {
      modalBoxRef.current.focus();
    }

    // Keyboard focus trap inside the modal box
    const handleFocusTrap = (e) => {
      if (!modalBoxRef.current) return;
      if (e.key !== "Tab") return;

      const focusableSelectors =
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
      const focusables = modalBoxRef.current.querySelectorAll(focusableSelectors);
      if (focusables.length === 0) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        // Shift + Tab -> loop backwards
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab -> loop forwards
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleFocusTrap);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleFocusTrap);
      // Restore previous focus
      if (previousFocusedElement && typeof previousFocusedElement.focus === "function") {
        previousFocusedElement.focus();
      }
    };
  }, [isOpen, onClose]);

  // Don't render anything when closed.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      {/* Modal Box */}
      <div
        ref={modalBoxRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`w-full ${size} rounded-xl bg-white shadow-2xl animate-fade-in outline-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-800">
            {title}
          </h2>

          <button
            onClick={onClose}
            aria-label="Close dialog"
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