import React, { useState } from "react";
import { X, Briefcase } from "lucide-react";

export default function EditJobModal({ job, onClose, onSave }) {
  const [title, setTitle] = useState(job?.title || "");
  const [description, setDescription] = useState(job?.description || "");
  const [location, setLocation] = useState(job?.location || "");
  const [employmentType, setEmploymentType] = useState(job?.employment_type || "full-time");
  const [skills, setSkills] = useState(
    (job?.skills_required || job?.required_skills || []).join(", ")
  );
  const [minExperience, setMinExperience] = useState(job?.minimum_experience || 0);
  const [salaryMin, setSalaryMin] = useState(job?.salary_min || "");
  const [salaryMax, setSalaryMax] = useState(job?.salary_max || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(job.id, {
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || null,
        employment_type: employmentType,
        required_skills: skills
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
        minimum_experience: parseInt(minExperience) || 0,
        salary_min: salaryMin ? parseInt(salaryMin) : null,
        salary_max: salaryMax ? parseInt(salaryMax) : null,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-[#0f172a] border border-gray-800/80 rounded-3xl p-8 shadow-2xl max-h-[85vh] overflow-y-auto animate-[fadeIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white p-2 rounded-xl hover:bg-gray-800/50 transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Briefcase size={20} />
          </div>
          <h2 className="text-xl font-extrabold text-white">Edit Job Posting</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Job Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote, New York, etc."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="python, react, sql"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Min Experience (yrs)
              </label>
              <input
                type="number"
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
                min={0}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Salary Min ($)
              </label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="80000"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Salary Max ($)
              </label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="150000"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-800/80">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-black font-bold px-8 py-3 rounded-xl shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white px-6 py-3 rounded-xl hover:bg-gray-800/50 transition-all font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
