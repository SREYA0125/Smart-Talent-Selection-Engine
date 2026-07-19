import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import Button from "./Button";

/*
|--------------------------------------------------------------------------
| Reusable Error State Component
|--------------------------------------------------------------------------
| Displays an alert message box when API/network queries fail, supporting
| optional title, message details, and a RotateCcw Retry callback action.
|--------------------------------------------------------------------------
*/

export default function ErrorState({
  title = "An error occurred",
  message = "Failed to load data. Please check your connection and try again.",
  onRetry,
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-md mx-auto my-8 shadow-sm">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto mb-4">
        <AlertCircle className="w-6 h-6 shrink-0" />
      </div>
      <h3 className="text-lg font-semibold text-red-900">{title}</h3>
      <p className="text-sm text-red-700 mt-2 mb-6 max-w-xs mx-auto">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700 text-white"
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          Retry
        </Button>
      )}
    </div>
  );
}
