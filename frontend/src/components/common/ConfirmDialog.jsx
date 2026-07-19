import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle } from "lucide-react";

/*
|--------------------------------------------------------------------------
| Reusable Confirmation Dialog Component
|--------------------------------------------------------------------------
| A non-blocking confirm overlay matching the UI aesthetics to replace legacy
| browser window.confirm prompts.
|--------------------------------------------------------------------------
*/

export default function ConfirmDialog({
  isOpen,
  onClose,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
  isDangerous = true,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <div className="flex gap-4 items-start">
          {isDangerous && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          <div className="space-y-2">
            <p className="text-gray-600 text-sm">{message}</p>
            {isDangerous && (
              <p className="text-xs text-red-500 font-medium">This action cannot be undone.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDangerous ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
