// A single styled form input. Accepts a `label` prop so forms don't
// repeat the label + input + spacing markup every time a field is needed.
export default function Input({ label, id, className = "", error, required, ...props }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={id}
        className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
          error
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-accent focus:border-accent"
        } ${className}`}
        required={required}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-600 font-medium mt-0.5 animate-slide-in">
          {error}
        </span>
      )}
    </div>
  );
}
