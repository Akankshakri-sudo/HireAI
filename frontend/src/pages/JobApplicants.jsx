import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobsAPI, applicationsAPI, interviewsAPI } from "../services/api";
import {
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  Brain,
  Copy,
  CheckCircle,
  Briefcase,
  AlertTriangle,
  UserCheck,
  Users,
  Printer,
  Calendar,
  Video,
  X,
  Clock,
  ExternalLink,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { useToast } from "../components/Toast";
import ATSRadial from "../components/ATSRadial";
import EmptyState from "../components/EmptyState";

export default function JobApplicants() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);

  // Interview Questions state
  const [questions, setQuestions] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [copied, setCopied] = useState(false);

  // Interview Schedule Modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleApp, setScheduleApp] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    scheduled_at: "",
    duration_minutes: 45,
    round_name: "Technical Round",
    meeting_link: "",
    notes: "",
  });
  const [scheduling, setScheduling] = useState(false);

  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(null);
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadApplicants = async () => {
    try {
      const jobDetails = await jobsAPI.getJobById(jobId);
      setJob(jobDetails);

      const apps = await applicationsAPI.getJobApplicants(jobId);
      setApplicants(apps);
    } catch (err) {
      console.error(err);
      showToast("Failed to load applicants or job details.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, [jobId]);

  const handleUpdateStatus = async (appId, newStatus) => {
    setStatusUpdating(appId);
    try {
      await applicationsAPI.updateStatus(appId, newStatus);
      showToast("Status updated successfully", "success");
      await loadApplicants();
    } catch (err) {
      console.error(err);
      showToast("Failed to update application status.", "error");
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleGenerateQuestions = async (app) => {
    setSelectedApp(app);
    setLoadingQuestions(true);
    setQuestions(null);
    setCopied(false);
    try {
      const qData = await applicationsAPI.generateQuestions(app.id);
      setQuestions(qData);
    } catch (err) {
      console.error(err);
      showToast("Failed to generate AI interview questions.", "error");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const openScheduleModal = (app, e) => {
    e.stopPropagation();
    setScheduleApp(app);
    // Set default time to tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const tzOffset = tomorrow.getTimezoneOffset() * 60000;
    const localISOTime = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);

    setScheduleForm({
      scheduled_at: localISOTime,
      duration_minutes: 45,
      round_name: "Technical Round",
      meeting_link: "https://meet.google.com/new",
      notes: "Please be ready with your development environment.",
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleApp) return;
    setScheduling(true);
    try {
      await interviewsAPI.scheduleInterview({
        application_id: scheduleApp.id,
        scheduled_at: new Date(scheduleForm.scheduled_at).toISOString(),
        duration_minutes: parseInt(scheduleForm.duration_minutes),
        round_name: scheduleForm.round_name,
        meeting_link: scheduleForm.meeting_link,
        notes: scheduleForm.notes,
      });
      showToast("Interview scheduled and candidate notified!", "success");
      setShowScheduleModal(false);
      loadApplicants();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to schedule interview", "error");
    } finally {
      setScheduling(false);
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

HR Questions:
${questions.hr.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Coding Questions:
${questions.coding.map((q, i) => `${i + 1}. ${q}`).join("\n")}
    `;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-white font-outfit selection:bg-emerald-500/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation & Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/recruiter/dashboard")}
            className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{job?.title || "Job Applicants"}</h1>
            <p className="text-gray-400 text-sm">{job?.location} • {job?.employment_type?.replace('_', '-')}</p>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Center - Applicant Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-emerald-400" size={20} />
                Candidates Applied ({applicants.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-500 animate-pulse">Loading candidate list...</div>
            ) : applicants.length > 0 ? (
              <div className="space-y-4">
                {applicants.map((app) => (
                  <div
                    key={app.id}
                    className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 hover:border-emerald-500/30 transition-all shadow-md space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {app.candidate?.name || app.candidate?.full_name || "Applicant"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-2">
                          <span className="flex items-center gap-1">
                            <Mail size={13} className="text-emerald-400" /> {app.candidate?.email}
                          </span>
                          {app.candidate?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={13} className="text-emerald-400" /> {app.candidate?.phone}
                            </span>
                          )}
                          {app.candidate?.location && (
                            <span className="flex items-center gap-1">
                              <BookOpen size={13} className="text-emerald-400" /> {app.candidate?.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-[11px] text-gray-400 uppercase font-semibold">Match Score</p>
                          <p className="text-lg font-bold text-emerald-400">{app.ai_match_score}%</p>
                        </div>
                        <ATSRadial score={app.ai_match_score} size="sm" />
                      </div>
                    </div>

                    {/* Actions & Status */}
                    <div className="pt-4 border-t border-gray-800/60 flex flex-wrap gap-3 items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs font-medium">Status:</span>
                        <select
                          value={app.status}
                          disabled={statusUpdating === app.id}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                          className="bg-[#070b13] border border-gray-700 text-gray-300 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500/50 cursor-pointer capitalize"
                        >
                          <option value="applied">Applied</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview">Interview</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => openScheduleModal(app, e)}
                          className="px-3.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Calendar size={14} /> Schedule Interview
                        </button>

                        <button
                          onClick={() => handleGenerateQuestions(app)}
                          className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Brain size={14} /> AI Questions
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={Users} 
                title="No applicants yet" 
                description="We will notify you as soon as candidates start applying." 
              />
            )}
          </div>

          {/* Right Side - AI Workspace Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0f172a]/60 border border-gray-800/80 p-6 rounded-2xl md:rounded-3xl backdrop-blur-md shadow-lg sticky top-24">
              <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                <Brain className="text-emerald-400" size={20} /> AI Interview Workspace
              </h3>

              {questions ? (
                <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                    <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      Generated Questions
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handlePrint}
                        className="text-gray-400 hover:text-emerald-400 flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Printer size={13} /> PDF
                      </button>
                      <button
                        onClick={copyToClipboard}
                        className="text-gray-400 hover:text-emerald-400 flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {copied ? <UserCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Technical questions */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Technical</h4>
                    <ul className="space-y-2 text-xs text-gray-300">
                      {questions.technical.map((q, idx) => (
                        <li key={idx} className="p-2.5 rounded-xl bg-gray-800/40 border border-gray-700/40">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Coding questions */}
                  {questions.coding?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Coding & Design</h4>
                      <ul className="space-y-2 text-xs text-gray-300">
                        {questions.coding.map((q, idx) => (
                          <li key={idx} className="p-2.5 rounded-xl bg-gray-800/40 border border-gray-700/40">
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Behavioral questions */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Behavioral</h4>
                    <ul className="space-y-2 text-xs text-gray-300">
                      {questions.behavioral.map((q, idx) => (
                        <li key={idx} className="p-2.5 rounded-xl bg-gray-800/40 border border-gray-700/40">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : loadingQuestions ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-gray-400">Analyzing resume skills & drafting tailored questions...</p>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-800 rounded-xl">
                  Select a candidate and click <strong className="text-emerald-400">"AI Questions"</strong> to generate tailored interview questions based on their resume skills.
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-[#0f172a] border border-gray-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Schedule Interview</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Candidate: <span className="text-emerald-400 font-semibold">{scheduleApp?.candidate?.name || scheduleApp?.candidate?.email}</span>
                </p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Round Name
                </label>
                <input
                  type="text"
                  required
                  value={scheduleForm.round_name}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, round_name: e.target.value })}
                  placeholder="e.g. Technical Round 1, System Design, HR"
                  className="w-full px-4 py-2.5 bg-[#070b13] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleForm.scheduled_at}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_at: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#070b13] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Duration (mins)
                  </label>
                  <select
                    value={scheduleForm.duration_minutes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, duration_minutes: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#070b13] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Meeting Link (Google Meet / Zoom / Teams)
                </label>
                <input
                  type="url"
                  value={scheduleForm.meeting_link}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, meeting_link: e.target.value })}
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                  className="w-full px-4 py-2.5 bg-[#070b13] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Notes for Candidate (Optional)
                </label>
                <textarea
                  rows={2}
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  placeholder="e.g. Please be prepared to write code in a live environment..."
                  className="w-full px-4 py-2 bg-[#070b13] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                  {scheduling ? "Scheduling..." : "Confirm Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
