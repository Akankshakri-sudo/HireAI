import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { EMPLOYMENT_TYPES } from "../constants";

export default function SearchFilters({ onSearch, onFilter, filters = {} }) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    employment_type: filters.employment_type || "",
    location: filters.location || "",
    salary_min: filters.salary_min || "",
    salary_max: filters.salary_max || "",
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleFilterChange = useCallback(
    (key, value) => {
      const updated = { ...localFilters, [key]: value };
      setLocalFilters(updated);
      onFilter(updated);
    },
    [localFilters, onFilter]
  );

  const clearFilters = () => {
    const empty = { employment_type: "", location: "", salary_min: "", salary_max: "" };
    setLocalFilters(empty);
    setQuery("");
    onSearch("");
    onFilter(empty);
  };

  const hasActiveFilters =
    query ||
    localFilters.employment_type ||
    localFilters.location ||
    localFilters.salary_min ||
    localFilters.salary_max;

  const inputClass =
    "bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all";

  return (
    <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-4 mb-6">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs by title or skills..."
            className={`${inputClass} w-full pl-10`}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
            showFilters || hasActiveFilters
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-[#070b13]/80 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white"
          }`}
        >
          <Filter size={16} />
          <span className="hidden sm:inline">Filters</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
          />
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-rose-400 hover:border-rose-500/30 text-sm transition-all cursor-pointer"
          >
            <X size={14} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-800/60 animate-[fadeIn_0.2s_ease-out]">
          <div>
            <label className="block text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
              Employment Type
            </label>
            <select
              value={localFilters.employment_type}
              onChange={(e) => handleFilterChange("employment_type", e.target.value)}
              className={`${inputClass} w-full cursor-pointer`}
            >
              <option value="">All Types</option>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={localFilters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              placeholder="Any location"
              className={`${inputClass} w-full`}
            />
          </div>
          <div>
            <label className="block text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
              Salary Min ($)
            </label>
            <input
              type="number"
              value={localFilters.salary_min}
              onChange={(e) => handleFilterChange("salary_min", e.target.value)}
              placeholder="0"
              className={`${inputClass} w-full`}
            />
          </div>
          <div>
            <label className="block text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
              Salary Max ($)
            </label>
            <input
              type="number"
              value={localFilters.salary_max}
              onChange={(e) => handleFilterChange("salary_max", e.target.value)}
              placeholder="No limit"
              className={`${inputClass} w-full`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
