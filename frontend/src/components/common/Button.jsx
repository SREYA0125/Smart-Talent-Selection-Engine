// A single styled <button>, so every screen in the app uses one visual
// definition of "primary button" instead of Tailwind classes copy-pasted
// (and slowly drifting apart) across dozens of files.

export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-accent text-white hover:opacity-90",

    secondary:
      "border border-gray-300 text-ink hover:bg-gray-50",

    danger:
      "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}