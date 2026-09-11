import React from "react";

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="bg-[#0f172a]/40 border border-gray-800/80 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-800/50 border border-gray-700 text-gray-500 flex items-center justify-center mb-6">
          <Icon size={32} />
        </div>
      )}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-semibold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
