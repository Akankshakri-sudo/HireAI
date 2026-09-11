import React, { useState } from "react";
import { X, MapPin, Briefcase, DollarSign, Clock, Sparkles } from "lucide-react";
import ATSRadial from "./ATSRadial";

export default function JobDetailModal({
  job,
  onClose,
  onApply,
  isApplied = false,
  applicationStatus = "",
}) {
  const [applying, setApplying] = useState(false);

  if (!job) return null;

  const handleApply = async () => {
    setApplying(true);
    try {
      await onApply(job.job_id);
    } finally {
      setApplying(false);
    }
  };

  const statusColors = {
    applied: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    reviewed: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    shortlisted: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    selected: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    rejected: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl bg-[#0f172a] border border-gray-800/80 rounded-3xl p-8 shadow-2xl max-h-[85vh] overflow-y-auto animate-[fadeIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white p-2 rounded-xl hover:bg-gray-800/50 transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-5 mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold text-white mb-2">
              {job.job_title || job.title}
            </h2>
            <div className="flex flex-wrap gap-3 text-sm text-gray-400">
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} /> {job.location}
                </span>
              )}
              {job.employment_type && (
                <span className="flex items-center gap-1.5">
                  <Briefcase size={14} /> {job.employment_type}
                </span>
              )}
              {(job.salary_min || job.salary_max) && (
                <span className="flex items-center gap-1.5">
                  <DollarSign size={14} />
                  {job.salary_min && job.salary_max
                    ? `$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max / 1000).toFixed(0)}k`
                    : job.salary_min
                    ? `From $${(job.salary_min / 1000).toFixed(0)}k`
                    : `Up to $${(job.salary_max / 1000).toFixed(0)}k`}
                </span>
              )}
              {job.minimum_experience > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> {job.minimum_experience}+ yrs
                </span>
              )}
            </div>
          </div>
          {job.match_score !== undefined && (
            <ATSRadial score={job.match_score} size="md" />
          )}
        </div>

        {/* Description */}
        {job.description && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
        )}

        {/* Skills */}
        {(job.job_skills || job.required_skills || job.skills_required) && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {(job.job_skills || job.required_skills || job.skills_required || []).map(
                (skill, i) => {
                  const isMatched = (job.matched_skills || []).includes(skill);
                  return (
                    <span
                      key={i}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        isMatched
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {skill}
                    </span>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {job.missing_skills && job.missing_skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Skills to Learn
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.missing_skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action */}
        <div className="flex items-center gap-4 pt-6 border-t border-gray-800/80">
          {isApplied ? (
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-xl text-sm font-bold border ${
                  statusColors[applicationStatus] || statusColors.applied
                }`}
              >
                {applicationStatus
                  ? applicationStatus.charAt(0).toUpperCase() +
                    applicationStatus.slice(1)
                  : "Applied"}
              </span>
              <span className="text-gray-500 text-sm">
                You've already applied to this position
              </span>
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-black font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} />
              {applying ? "Applying..." : "Apply Now"}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
