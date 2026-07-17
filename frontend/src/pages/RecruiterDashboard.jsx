import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { recruiterAPI, jobsAPI } from "../services/api";
import {
  Plus,
  Briefcase,
  Users,
  Building,
  Settings,
  MapPin,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Check,
} from "lucide-react";

export default function RecruiterDashboard() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isPostingJob, setIsPostingJob] = useState(false);

  // Job creation state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [empType, setEmpType] = useState("full-time");
  const [reqSkills, setReqSkills] = useState("");
  const [minExp, setMinExp] = useState("0");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [deadline, setDeadline] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadRecruiterData = async () => {
    try {
      // 1. Fetch recruiter profile
      const prof = await recruiterAPI.getProfile();
      setProfile(prof);

      // 2. Fetch all jobs (we can filter in frontend by recruiter_id to show only recruiter's own jobs!)
      const allJobs = await jobsAPI.getJobs();
      // Filter jobs where recruiter_id matches profile.id
      const myJobs = allJobs.filter((job) => job.recruiter_id === prof.id);
      setJobs(myJobs);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404 && !profile) {
        // Recruiter profile doesn't exist yet, redirect to setup
        navigate("/recruiter/profile");
      } else {
        setError("Failed to load recruiter data. Please refresh.");
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadRecruiterData();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!title || !description || description.length < 20) {
      setError("Job Title is required and description must be at least 20 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const skillList = reqSkills
      ? reqSkills
          .split(",")
          .map((s) => s.trim().lower())
          .filter((s) => s.length > 0)
      : [];

    const jobData = {
      title: title.trim(),
      description: description.trim(),
      location: location || null,
      employment_type: empType,
      required_skills: skillList,
      minimum_experience: parseInt(minExp) || 0,
      salary_min: salaryMin ? parseInt(salaryMin) : null,
      salary_max: salaryMax ? parseInt(salaryMax) : null,
      application_deadline: deadline || null,
    };

    try {
      await jobsAPI.createJob(jobData);
      setSuccess("Job posted successfully!");
      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setEmpType("full-time");
      setReqSkills("");
      setMinExp("0");
      setSalaryMin("");
      setSalaryMax("");
      setDeadline("");
      setIsPostingJob(false);

      // Reload jobs
      await loadRecruiterData();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Failed to create job posting. Please check parameters."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 border-r-2" />
        <span className="ml-3 font-medium">Assembling recruiter workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-gray-800/80 bg-[#070b13]/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-extrabold shadow-lg shadow-emerald-500/20">
              H
            </div>
            <span className="text-xl font-bold tracking-tight text-white">HireAI Recruiter</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-400 hidden sm:inline">
              Company: <span className="text-white font-semibold">{profile?.company?.name}</span>
            </span>
            <Link
              to="/recruiter/profile"
              className="text-gray-300 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              <Settings size={16} /> Edit Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-rose-400 text-sm font-medium transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Stats Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Stat 1 */}
          <div className="bg-[#0f172a]/60 border border-gray-800/80 p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Jobs Created</span>
              <h3 className="text-3xl font-extrabold text-white mt-1">{jobs.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Briefcase size={22} />
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-[#0f172a]/60 border border-gray-800/80 p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Company Branch</span>
              <h3 className="text-lg font-bold text-white mt-2 truncate max-w-[180px]">
                {profile?.company?.location || "Not configured"}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Building size={22} />
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-[#0f172a]/60 border border-gray-800/80 p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Corporate Industry</span>
              <h3 className="text-sm font-bold text-white mt-2 truncate max-w-[180px]">
                {profile?.company?.industry || "SaaS / Cloud"}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp size={22} />
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Active Job Postings</h2>
              <p className="text-gray-400 text-xs mt-1">Manage positions and review AI-ranked applicants.</p>
            </div>
            <button
              onClick={() => setIsPostingJob(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/5 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={18} /> Post a Job
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-2 text-rose-400 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-[#0f172a]/60 border border-gray-800/80 hover:border-emerald-500/30 p-6 rounded-2xl backdrop-blur-md shadow-md flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {job.location || "Remote"}
                          </span>
                          <span className="capitalize">{job.employment_type}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xxs uppercase tracking-wider font-bold ${
                        job.is_active
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : "bg-gray-800 text-gray-500"
                      }`}>
                        {job.is_active ? "Active" : "Closed"}
                      </span>
                    </div>

                    {/* Required Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {job.required_skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gray-800/60 border border-gray-700/80 text-gray-300 text-xxs px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800/60 flex items-center justify-between">
                    <span className="text-gray-400 text-xs">
                      Min Experience: <span className="text-white font-bold">{job.minimum_experience} yrs</span>
                    </span>
                    <Link
                      to={`/recruiter/job-applicants/${job.id}`}
                      className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      View Applicants <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0f172a]/40 border border-gray-800/80 rounded-2xl p-12 text-center text-gray-400">
              <Briefcase size={36} className="mx-auto mb-4 text-gray-600" />
              <p className="font-semibold text-white">No jobs posted yet</p>
              <p className="text-xs text-gray-500 mt-1">Click "Post a Job" to list your first vacancy.</p>
            </div>
          )}
        </div>
      </main>

      {/* Post Job Modal */}
      {isPostingJob && (
        <div className="fixed inset-0 bg-[#070b13]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0f172a] border border-gray-800 rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-800/80">
              <div>
                <h3 className="text-xl font-extrabold text-white">Create Job Opening</h3>
                <p className="text-gray-400 text-xs mt-1">Define requirements and required skill sets.</p>
              </div>
              <button
                onClick={() => setIsPostingJob(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-5">
              {/* Job Title */}
              <div>
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Senior Python / FastAPI Developer"
                  className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  Job Description * (min. 20 characters)
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="We are looking for a backend software engineer to design and develop robust APIs. You will collaborate closely with product managers and work with Python, FastAPI, and Postgres."
                  rows={4}
                  className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Location */}
                <div>
                  <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA or Remote"
                    className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                  />
                </div>

                {/* Employment Type */}
                <div>
                  <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                    Employment Type
                  </label>
                  <select
                    value={empType}
                    onChange={(e) => setEmpType(e.target.value)}
                    className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              {/* Skills and Exp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                    Required Technical Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={reqSkills}
                    onChange={(e) => setReqSkills(e.target.value)}
                    placeholder="python, fastapi, sql, docker"
                    className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                    Minimum Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={minExp}
                    onChange={(e) => setMinExp(e.target.value)}
                    min="0"
                    className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Salary Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                    Minimum Annual Salary ($)
                  </label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="80000"
                    className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                    Maximum Annual Salary ($)
                  </label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="120000"
                    className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-800/80 flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-all cursor-pointer"
                >
                  {loading ? "Posting..." : "Publish Job"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPostingJob(false)}
                  className="bg-gray-850 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-300 font-bold px-6 py-3.5 rounded-xl active:scale-[0.98] transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
