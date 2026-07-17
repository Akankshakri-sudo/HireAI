import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { candidateAPI, applicationsAPI } from "../services/api";
import {
  Upload,
  FileText,
  Briefcase,
  Settings,
  Percent,
  Search,
  CheckCircle,
  FileUp,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

export default function CandidateDashboard() {
  const [profile, setProfile] = useState(null);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [applying, setApplying] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fetching, setFetching] = useState(true);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadDashboardData = async () => {
    try {
      // 1. Get candidate profile
      const prof = await candidateAPI.getProfile();
      setProfile(prof);

      // 2. Get resume analysis details (if analyzed)
      try {
        const analysis = await candidateAPI.getResumeAnalysis();
        setResumeAnalysis(analysis);
      } catch (err) {
        if (err.response?.status !== 404) console.error(err);
      }

      // 3. Get matched jobs list
      const jobs = await candidateAPI.getMatchedJobs();
      setMatchedJobs(jobs);

      // 4. Get candidate applications
      const apps = await applicationsAPI.getMyApplications();
      setMyApplications(apps);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404 && !profile) {
        // Redirect to profile setup if candidate profile is completely missing
        navigate("/candidate/profile");
      } else {
        setError("Failed to load dashboard data. Please try refreshing.");
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      setMessage("Uploading resume PDF...");
      await candidateAPI.uploadResume(file);

      setMessage("AI is extracting skills and parsing details...");
      setAnalyzing(true);
      await candidateAPI.analyzeResume();

      setMessage("Analysis complete! Reloading dashboard...");
      await loadDashboardData();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Failed to process resume. Please ensure it is a valid PDF."
      );
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!resumeAnalysis) {
      setError("Please upload and analyze your resume before applying.");
      return;
    }

    setApplying(true);
    setError("");
    setMessage("");

    try {
      await applicationsAPI.applyToJob(jobId);
      setMessage("Applied successfully!");
      // Reload applications and jobs list to update states
      const apps = await applicationsAPI.getMyApplications();
      setMyApplications(apps);
      setSelectedJob(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Application failed. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const isApplied = (jobId) => {
    return myApplications.some((app) => app.job_id === jobId);
  };

  const getApplicationStatus = (jobId) => {
    const app = myApplications.find((a) => a.job_id === jobId);
    return app ? app.status : "";
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
        <span className="ml-3 font-medium">Assembling candidate panel...</span>
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
            <span className="text-xl font-bold tracking-tight text-white">HireAI Portal</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-400 hidden sm:inline">
              Welcome, <span className="text-white font-semibold">{user.full_name}</span>
            </span>
            <Link
              to="/candidate/profile"
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
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Resume Analysis & Status */}
        <div className="lg:col-span-1 space-y-8">
          {/* Status Display Info */}
          <div className="bg-[#0f172a]/60 border border-gray-800/80 p-6 rounded-2xl backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-lg">My ATS Score</h3>
              {resumeAnalysis && (
                <span className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <Sparkles size={12} className="animate-pulse" /> Active Matcher
                </span>
              )}
            </div>

            {resumeAnalysis ? (
              <div className="flex flex-col items-center py-6">
                {/* Visual ATS Percentage Indicator */}
                <div className="relative w-36 h-36 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent border-l-transparent animate-spin-slow pointer-events-none" />
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-white">
                      {resumeAnalysis.total_skills_found > 0 ? "ATS" : "0"}
                    </span>
                    <span className="text-emerald-400 text-xs font-bold mt-1">
                      {resumeAnalysis.total_skills_found} Skills Found
                    </span>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <div className="border-t border-gray-800/85 pt-4">
                    <span className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Extracted Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {resumeAnalysis.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="bg-gray-800/80 border border-gray-700/85 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-lg"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-800/85 pt-4 text-xs text-gray-400 flex items-center gap-1.5">
                    <Clock size={14} /> Analyzed: {new Date(resumeAnalysis.analyzed_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-gray-800/50 border border-gray-700 text-gray-500 flex items-center justify-center mb-4">
                  <FileText size={28} />
                </div>
                <h4 className="font-bold text-white mb-2">No Resume Found</h4>
                <p className="text-gray-400 text-xs mb-6 max-w-[220px]">
                  Upload a PDF version of your resume to parse technical skills and unlock job matching scores.
                </p>
              </div>
            )}

            {/* Resume Uploader Drop Zone */}
            <div className="border border-dashed border-gray-800 hover:border-emerald-500/40 rounded-xl p-6 bg-[#070b13]/40 text-center transition-colors cursor-pointer relative overflow-hidden group">
              <input
                type="file"
                accept=".pdf"
                disabled={uploading}
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <FileUp size={24} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
                <span className="text-sm font-semibold text-gray-300">
                  {uploading ? "Processing file..." : "Upload Resume PDF"}
                </span>
                <span className="text-gray-500 text-xs">PDF format, max 5MB</span>
              </div>
            </div>
          </div>

          {/* Feedback details */}
          {(error || message) && (
            <div className="p-4 rounded-xl text-sm border">
              {error && (
                <div className="text-rose-400 bg-rose-500/5 border-rose-500/10 flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}
              {message && (
                <div className="text-emerald-400 bg-emerald-500/5 border-emerald-500/10 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-t border-emerald-400" />
                  {message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Job Matches List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-white text-xl">Semantic Job Recommendations</h3>
            <span className="text-gray-400 text-xs">{matchedJobs.length} matches found</span>
          </div>

          {matchedJobs.length > 0 ? (
            <div className="space-y-4">
              {matchedJobs.map((jobMatch) => (
                <div
                  key={jobMatch.job_id}
                  onClick={() => setSelectedJob(jobMatch)}
                  className="bg-[#0f172a]/60 border border-gray-800/80 hover:border-emerald-500/30 p-6 rounded-2xl backdrop-blur-md shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                        {jobMatch.job_title}
                      </h4>
                      <p className="text-gray-400 text-xs font-semibold tracking-wide uppercase mt-1">
                        Matching ATS Index
                      </p>
                    </div>

                    {/* Match Badge */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/60 border border-gray-700/80">
                        <span className="text-emerald-400 font-bold text-sm">
                          {Math.round(jobMatch.match_score)}%
                        </span>
                        <span className="text-gray-500 text-xs">match</span>
                      </div>

                      {isApplied(jobMatch.job_id) && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          getApplicationStatus(jobMatch.job_id) === "shortlisted"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : getApplicationStatus(jobMatch.job_id) === "rejected"
                            ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                            : "bg-teal-500/10 border border-teal-500/20 text-teal-400"
                        }`}>
                          {getApplicationStatus(jobMatch.job_id)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skills lists */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {jobMatch.matched_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                    {jobMatch.missing_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-800/40 border border-gray-800 text-gray-500 px-2 py-0.5 rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0f172a]/40 border border-gray-800/80 rounded-2xl p-12 text-center text-gray-400">
              <Briefcase size={36} className="mx-auto mb-4 text-gray-600 animate-pulse" />
              <p className="font-semibold text-white">No jobs available right now</p>
              <p className="text-xs text-gray-500 mt-1">Please check back later or modify your profile skills.</p>
            </div>
          )}
        </div>
      </main>

      {/* Selected Job Drawer Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-[#070b13]/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-xl bg-[#0f172a] border-l border-gray-800 h-full p-8 overflow-y-auto flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Job Details</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{selectedJob.job_title}</h3>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Match Details */}
              <div className="bg-[#070b13]/60 border border-gray-800/85 p-5 rounded-2xl mb-8 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-300">AI Scoring Summary</h4>
                  <p className="text-xs text-gray-400 mt-1">Matched using profile parsing index</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-extrabold text-2xl">
                  {Math.round(selectedJob.match_score)}%
                </div>
              </div>

              {/* Skills Breakdown */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                    Matched Skills ({selectedJob.matched_skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.matched_skills.length > 0 ? (
                      selectedJob.matched_skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-xl"
                        >
                          ✓ {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-xs">No technical skill intersections found.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3">
                    Missing Skills ({selectedJob.missing_skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.missing_skills.length > 0 ? (
                      selectedJob.missing_skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs px-3 py-1 rounded-xl"
                        >
                          ✕ {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-emerald-400 text-xs font-bold">Awesome! You possess all required skills!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-800/80 flex gap-4 mt-8">
              {isApplied(selectedJob.job_id) ? (
                <button
                  disabled
                  className="flex-1 bg-gray-800 border border-gray-700 text-gray-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Already Applied
                </button>
              ) : (
                <button
                  onClick={() => handleApply(selectedJob.job_id)}
                  disabled={applying}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  {applying ? "Applying..." : "Apply Now"}
                </button>
              )}
              <button
                onClick={() => setSelectedJob(null)}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 font-bold px-6 py-4 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
