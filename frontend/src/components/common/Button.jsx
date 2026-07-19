// A single styled <button>, so every screen in the app uses one visual
// definition of "primary button" instead of Tailwind classes copy-pasted
// (and slowly drifting apart) across dozens of files.

export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  loading = false,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-accent text-white hover:opacity-90",

    secondary:
      "border border-gray-300 text-ink hover:bg-gray-50 bg-white",

    danger:
      "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}