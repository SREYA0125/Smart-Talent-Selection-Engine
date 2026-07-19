import React from "react";
import Button from "./Button";

/*
|--------------------------------------------------------------------------
| Reusable Empty State Component
|--------------------------------------------------------------------------
| Renders a centered empty state visual block containing an icon, a descriptive
| title/message, and an optional primary call-to-action button.
|--------------------------------------------------------------------------
*/

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-gray-300 bg-white max-w-md mx-auto my-8">
      {Icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-4">
          <Icon className="w-6 h-6 shrink-0" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 mb-6 max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="px-4 py-2 text-sm font-medium">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
