import React, { useState, useEffect } from 'react';
import { getStoredUser } from '../utils/auth';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, Building, Calendar, ArrowLeft, Bookmark, BookmarkCheck,
  CheckCircle, Send, Briefcase, Users, DollarSign, Award
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ATSRadial from '../components/ATSRadial';
import { jobsAPI, applicationsAPI, savedJobsAPI } from '../services/api';
import { useToast } from '../components/Toast';

export default function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchScore, setMatchScore] = useState(null);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);

  const token = localStorage.getItem('token');
  const user = getStoredUser();
  const isCandidate = user?.role === 'candidate';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const jobData = await jobsAPI.getJobById(jobId);
        setJob(jobData);

        if (token && isCandidate) {
          // Check if already applied
          try {
            const apps = await applicationsAPI.getMyApplications();
            const myApp = (apps || []).find(a => a.job_id === parseInt(jobId));
            if (myApp) setApplied(true);
          } catch { /* ignore */ }

          // Check if saved
          try {
            const savedList = await savedJobsAPI.getSavedJobs();
            if ((savedList || []).some(s => s.job_id === parseInt(jobId))) setSaved(true);
          } catch { /* ignore */ }

          // Get match score
          try {
            const match = await jobsAPI.matchJob(jobId);
            setMatchScore(match);
          } catch { /* ignore - no resume uploaded */ }
        }
      } catch (err) {
        showToast('Failed to load job details', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [jobId, token, isCandidate]);

  const handleApply = async () => {
    if (!token) { navigate('/login'); return; }
    setApplying(true);
    try {
      await applicationsAPI.applyToJob(parseInt(jobId));
      setApplied(true);
      showToast('Application submitted!', 'success');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to apply', 'error');
    } finally {
      setApplying(false);
    }
  };

  const toggleSave = async () => {
    if (!token) { navigate('/login'); return; }
    try {
      if (saved) {
        await savedJobsAPI.unsaveJob(parseInt(jobId));
        setSaved(false);
        showToast('Job unsaved', 'info');
      } else {
        await savedJobsAPI.saveJob(parseInt(jobId));
        setSaved(true);
        showToast('Job saved!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed', 'error');
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700/50 rounded w-1/3" />
            <div className="h-5 bg-gray-700/30 rounded w-1/4" />
            <div className="h-40 bg-gray-700/20 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#070b13]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Job not found</h2>
          <p className="text-gray-400 mb-6">This job may have been removed or is no longer active.</p>
          <button onClick={() => navigate('/jobs')} className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all">
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-white font-outfit selection:bg-emerald-500/30">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 sm:p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{job.title}</h1>
                  <p className="text-gray-400 flex items-center mt-2">
                    <Building className="w-4 h-4 mr-2" />
                    {job.company_name || 'Company'}
                  </p>
                </div>
                {isCandidate && (
                  <button onClick={toggleSave} className="p-2 rounded-lg hover:bg-white/5 transition-all">
                    {saved
                      ? <BookmarkCheck className="w-6 h-6 text-emerald-400" />
                      : <Bookmark className="w-6 h-6 text-gray-500 hover:text-gray-300" />
                    }
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                {job.location && (
                  <span className="flex items-center bg-gray-800/50 px-3 py-1.5 rounded-full text-gray-300">
                    <MapPin className="w-4 h-4 mr-1.5 text-emerald-400" /> {job.location}
                  </span>
                )}
                {job.employment_type && (
                  <span className="flex items-center bg-gray-800/50 px-3 py-1.5 rounded-full text-gray-300">
                    <Clock className="w-4 h-4 mr-1.5 text-emerald-400" /> {job.employment_type.replace('_', '-')}
                  </span>
                )}
                {formatSalary(job.salary_min, job.salary_max) && (
                  <span className="flex items-center bg-gray-800/50 px-3 py-1.5 rounded-full text-gray-300">
                    <DollarSign className="w-4 h-4 mr-1.5 text-emerald-400" /> {formatSalary(job.salary_min, job.salary_max)}
                  </span>
                )}
                {job.minimum_experience > 0 && (
                  <span className="flex items-center bg-gray-800/50 px-3 py-1.5 rounded-full text-gray-300">
                    <Award className="w-4 h-4 mr-1.5 text-emerald-400" /> {job.minimum_experience}+ yrs exp
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold mb-4">Job Description</h2>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{job.description}</div>
            </div>

            {/* Skills Required */}
            {(job.skills_required || job.required_skills)?.length > 0 && (
              <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-bold mb-4">Skills Required</h2>
                <div className="flex flex-wrap gap-2">
                  {(job.skills_required || job.required_skills).map((skill, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border
                        ${matchScore?.matched_skills?.includes(skill)
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300'
                        }`}
                    >
                      {matchScore?.matched_skills?.includes(skill) && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 sticky top-8">
              {applied ? (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-emerald-400 font-semibold text-lg">Application Submitted</p>
                  <p className="text-gray-400 text-sm mt-1">You've already applied to this job</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleApply}
                    disabled={applying || !isCandidate}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {applying ? 'Submitting...' : isCandidate ? 'Apply Now' : 'Login to Apply'}
                  </button>
                  {!isCandidate && !token && (
                    <p className="text-gray-500 text-xs text-center mt-3">Login as a candidate to apply</p>
                  )}
                </>
              )}
            </div>

            {/* Match Score Card */}
            {matchScore && (
              <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Your Match Score</h3>
                <div className="flex justify-center mb-4">
                  <ATSRadial score={matchScore.match_score} size="lg" />
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Matched Skills ({matchScore.matched_skills?.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {matchScore.matched_skills?.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded-full text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                  {matchScore.missing_skills?.length > 0 && (
                    <div>
                      <p className="text-gray-400 mb-1">Missing Skills ({matchScore.missing_skills?.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {matchScore.missing_skills?.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-300 rounded-full text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Job Info */}
            <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Job Info</h3>
              <div className="space-y-3 text-sm">
                {job.created_at && (
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </div>
                )}
                {job.deadline && (
                  <div className="flex items-center text-gray-300">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </div>
                )}
                {job.minimum_experience > 0 && (
                  <div className="flex items-center text-gray-300">
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    {job.minimum_experience}+ years experience
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
