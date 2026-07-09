/*
|--------------------------------------------------------------------------
| SkillList
|--------------------------------------------------------------------------
| Responsibilities:
| - Display a list of skills.
| - Used for both Matching Skills and Missing Skills.
| - Styling changes based on the variant.
|--------------------------------------------------------------------------
*/

export default function SkillList({
  title,
  skills = [],
  variant = "success",
}) {
  const styles = {
    success: {
      badge: "bg-green-100 text-green-700",
      icon: "✓",
      empty: "No matching skills found.",
    },

    danger: {
      badge: "bg-red-100 text-red-700",
      icon: "✕",
      empty: "No missing skills.",
    },
  };

  const current = styles[variant] || styles.success;

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">
        {title}
      </h3>

      {skills.length === 0 ? (
        <p className="text-sm text-gray-500">
          {current.empty}
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {skills.map((skill, index) => (
            <span
              key={index}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${current.badge}`}
            >
              <span>{current.icon}</span>
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}