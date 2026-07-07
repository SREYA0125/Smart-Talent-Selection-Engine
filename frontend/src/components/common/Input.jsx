// A single styled form input. Accepts a `label` prop so forms don't
// repeat the label + input + spacing markup every time a field is needed.
export default function Input({ label, id, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${className}`}
        {...props}
      />
    </div>
  );
}
