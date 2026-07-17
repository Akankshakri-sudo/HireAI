import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobsAPI, applicationsAPI } from "../services/api";
import {
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  Settings,
  Brain,
  Copy,
  CheckCircle,
  Briefcase,
  AlertTriangle,
  UserCheck,
  Users,
} from "lucide-react";

export default function JobApplicants() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);

  // Interview Questions state
  const [questions, setQuestions] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadApplicants = async () => {
    try {
      const jobDetails = await jobsAPI.getJobById(jobId);
      setJob(jobDetails);

      const apps = await applicationsAPI.getJobApplicants(jobId);
      setApplicants(apps);
    } catch (err) {
      console.error(err);
      setError("Failed to load applicants or job details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, [jobId]);

  const handleUpdateStatus = async (appId, newStatus) => {
    setStatusUpdating(appId);
    setError("");
    try {
      await applicationsAPI.updateStatus(appId, newStatus);
      // Reload applicants to reflect status update
      await loadApplicants();
    } catch (err) {
      console.error(err);
      setError("Failed to update application status.");
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleGenerateQuestions = async (appId) => {
    setLoadingQuestions(true);
    setQuestions(null);
    setCopied(false);
    try {
      const qData = await applicationsAPI.generateQuestions(appId);
      setQuestions(qData);
    } catch (err) {
      console.error(err);
      setError("Failed to generate AI interview questions.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const copyToClipboard = () => {
    if (!questions) return;
    const formatted = `
AI INTERVIEW QUESTIONS SHEET
============================
Technical Questions:
${questions.technical.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Behavioral Questions:
${questions.behavioral.map((q, i) => `${i + 1}. ${q}`).join("\n")}

HR Screening Questions:
${questions.hr.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Coding Questions:
${questions.coding.map((q, i) => `${i + 1}. ${q}`).join("\n")}
    `;

    navigator.clipboard.writeText(formatted.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 border-r-2" />
        <span className="ml-3 font-medium">Assembling applicant rankings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-gray-800/80 bg-[#070b13]/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/recruiter/dashboard")}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="font-bold text-lg text-white">Job Applications</span>
          </div>
          <span className="text-sm text-gray-400 font-semibold truncate max-w-[250px]">
            Role: <span className="text-white">{job?.title}</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left / Center Grid - Applicants List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-extrabold text-white">Ranked Job Applicants</h2>
            <span className="text-gray-400 text-xs">{applicants.length} applications received</span>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-2 text-rose-400 text-sm">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {applicants.length > 0 ? (
            <div className="space-y-4">
              {applicants.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`bg-[#0f172a]/60 border p-6 rounded-2xl backdrop-blur-md shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group flex flex-col justify-between ${
                    selectedApp?.id === app.id
                      ? "border-emerald-500/40"
                      : "border-gray-800/80 hover:border-emerald-500/20"
                  }`}
                >
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                          {app.candidate.full_name}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
                          {app.candidate.degree || "Software Engineer"}
                        </p>
                      </div>

                      {/* Score Indicator */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/60 border border-gray-700/85">
                          <span className="text-emerald-400 font-extrabold text-sm">
                            {app.match_score}%
                          </span>
                          <span className="text-gray-500 text-xs">match</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xxs font-bold uppercase tracking-wider ${
                          app.status === "shortlisted"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : app.status === "rejected"
                            ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                            : "bg-teal-500/10 border border-teal-500/20 text-teal-400"
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>

                    {/* Candidate Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400 mb-6">
                      <div className="flex items-center gap-1.5">
                        <Mail size={13} /> {app.candidate.email}
                      </div>
                      {app.candidate.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} /> {app.candidate.phone}
                        </div>
                      )}
                      {app.candidate.college && (
                        <div className="flex items-center gap-1.5 sm:col-span-2">
                          <BookOpen size={13} /> {app.candidate.college} ({app.candidate.graduation_year})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Question triggers */}
                  <div className="pt-4 border-t border-gray-800/60 flex flex-wrap gap-3 items-center justify-between">
                    {/* Status Dropdowns */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">Status:</span>
                      <select
                        value={app.status}
                        disabled={statusUpdating === app.id}
                        onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()} // prevent select from trigger card click
                        className="bg-gray-850 border border-gray-800 text-gray-300 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                      >
                        <option value="applied">Applied</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="selected">Selected</option>
                      </select>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateQuestions(app.id);
                      }}
                      className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Brain size={14} /> AI Questions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0f172a]/40 border border-gray-800/80 rounded-2xl p-12 text-center text-gray-400">
              <Users size={36} className="mx-auto mb-4 text-gray-600" />
              <p className="font-semibold text-white">No applicants yet</p>
              <p className="text-xs text-gray-500 mt-1">We will notify you as soon as candidates start applying.</p>
            </div>
          )}
        </div>

        {/* Right Side - Interactive Detail / AI Interview Helper Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0f172a]/60 border border-gray-800/80 p-6 rounded-2xl backdrop-blur-md shadow-lg sticky top-24">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <Brain className="text-emerald-400" size={20} /> AI Recruitment Workspace
            </h3>

            {questions ? (
              /* Generated Questions view */
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center pb-3 border-b border-gray-800/80">
                  <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    Questions Worksheet
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="text-gray-400 hover:text-white flex items-center gap-1 text-xs transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <UserCheck size={14} className="text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy All
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {/* Technical */}
                  <div>
                    <h4 className="font-bold text-xs text-white mb-2 uppercase tracking-wide">
                      Technical Focus
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-xs text-gray-300 pl-1">
                      {questions.technical.map((q, i) => (
                        <li key={i} className="leading-relaxed">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Coding */}
                  <div>
                    <h4 className="font-bold text-xs text-white mb-2 uppercase tracking-wide border-t border-gray-800/80 pt-3">
                      Coding Challenge
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-xs text-gray-300 pl-1">
                      {questions.coding.map((q, i) => (
                        <li key={i} className="leading-relaxed">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Behavioral */}
                  <div>
                    <h4 className="font-bold text-xs text-white mb-2 uppercase tracking-wide border-t border-gray-800/80 pt-3">
                      Behavioral Evaluation
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-xs text-gray-300 pl-1">
                      {questions.behavioral.map((q, i) => (
                        <li key={i} className="leading-relaxed">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* HR */}
                  <div>
                    <h4 className="font-bold text-xs text-white mb-2 uppercase tracking-wide border-t border-gray-800/80 pt-3">
                      HR Screening
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-xs text-gray-300 pl-1">
                      {questions.hr.map((q, i) => (
                        <li key={i} className="leading-relaxed">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : loadingQuestions ? (
              /* Loader state */
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 border-r-2 mb-4" />
                <p className="text-sm font-semibold">Generating customized questions...</p>
                <p className="text-xs text-gray-500 mt-1">Matching recruiter keywords to candidate resume</p>
              </div>
            ) : (
              /* Idle workspace state */
              <div className="py-12 text-center text-gray-500">
                <Briefcase size={28} className="mx-auto mb-4 text-gray-600 animate-pulse" />
                <p className="text-sm font-semibold text-gray-400">No Interview Sheets Generated</p>
                <p className="text-xs max-w-[200px] mx-auto mt-2">
                  Click the "AI Questions" button on any candidate profile card to generate custom questions.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
