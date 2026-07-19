import { ArrowUpDown } from "lucide-react";

/*
|--------------------------------------------------------------------------
| SortDropdown Component
|--------------------------------------------------------------------------
| Reusable sort selection dropdown with an ArrowUpDown icon.
|--------------------------------------------------------------------------
*/

export default function SortDropdown({
  value,
  onChange,
  options = [],
}) {
  return (
    <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 text-sm focus-within:ring-2 focus-within:ring-accent shrink-0">
      <ArrowUpDown size={16} className="text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus:outline-none bg-white text-gray-700 text-sm cursor-pointer border-0 p-0"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
