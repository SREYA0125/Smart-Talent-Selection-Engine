// A generic content container. Every future feature (a job card, a
// candidate card, a stats tile) can wrap itself in this instead of
// redefining the same border/padding/rounded-corner combination.
export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}
