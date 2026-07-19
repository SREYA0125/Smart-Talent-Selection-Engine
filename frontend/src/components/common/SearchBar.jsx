import { useEffect, useState } from "react";
import { Search } from "lucide-react";

/*
|--------------------------------------------------------------------------
| SearchBar Component
|--------------------------------------------------------------------------
| A reusable search input with built-in input debouncing. Calls the onSearch
| callback after the specified delay (defaults to 350ms).
|--------------------------------------------------------------------------
*/

export default function SearchBar({
  value,
  onSearch,
  placeholder = "Search...",
  delay = 350,
}) {
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, delay, onSearch]);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white text-gray-800"
      />
    </div>
  );
}
