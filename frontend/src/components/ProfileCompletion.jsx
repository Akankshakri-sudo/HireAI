import React from "react";
import { CheckCircle, Circle } from "lucide-react";

export default function ProfileCompletion({ sections = [] }) {
  const completed = sections.filter((s) => s.completed).length;
  const total = sections.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Profile Completion</h3>
        <span
          className={`text-sm font-bold ${
            percentage === 100 ? "text-emerald-400" : percentage >= 60 ? "text-amber-400" : "text-gray-400"
          }`}
        >
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            percentage === 100
              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
              : percentage >= 60
              ? "bg-gradient-to-r from-amber-500 to-yellow-500"
              : "bg-gradient-to-r from-gray-500 to-gray-400"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Section List */}
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {sections.map((section, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            {section.completed ? (
              <CheckCircle size={14} className="text-emerald-400" />
            ) : (
              <Circle size={14} className="text-gray-600" />
            )}
            <span
              className={
                section.completed ? "text-gray-300" : "text-gray-500"
              }
            >
              {section.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
