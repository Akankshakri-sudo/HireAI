import React, { useState, useEffect, useCallback } from 'react';
import { getStoredUser } from '../utils/auth';
import { EMPLOYMENT_TYPES } from '../constants';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Clock, Briefcase, ChevronLeft, ChevronRight,
  Bookmark, BookmarkCheck, Building, Filter, X, DollarSign
} from 'lucide-react';
import Navbar from '../components/Navbar';
import EmptyState from '../components/EmptyState';
import { jobsAPI, savedJobsAPI } from '../services/api';
import { useToast } from '../components/Toast';

const employmentTypes = [
  { label: 'All Types', value: '' },
  ...EMPLOYMENT_TYPES,
];

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [page, setPage] = useState(0);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const limit = 12;

  const { showToast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = getStoredUser();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { skip: page * limit, limit };
      if (search) params.search = search;
      if (location) params.location = location;
      if (employmentType) params.employment_type = employmentType;
      const data = await jobsAPI.getJobs(params);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, location, employmentType, showToast]);

  const fetchSavedJobs = useCallback(async () => {
    if (!token || user?.role !== 'candidate') return;
    try {
      const saved = await savedJobsAPI.getSavedJobs();
      setSavedJobIds(new Set((saved || []).map(s => s.job_id)));
    } catch { /* ignore */ }
  }, [token, user?.role]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => { fetchSavedJobs(); }, [fetchSavedJobs]);

  // Debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const toggleSave = async (jobId) => {
    if (!token) { navigate('/login'); return; }
    try {
      if (savedJobIds.has(jobId)) {
        await savedJobsAPI.unsaveJob(jobId);
        setSavedJobIds(prev => { const next = new Set(prev); next.delete(jobId); return next; });
        showToast('Job unsaved', 'info');
      } else {
        await savedJobsAPI.saveJob(jobId);
        setSavedJobIds(prev => new Set(prev).add(jobId));
        showToast('Job saved!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to save job', 'error');
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    const fmt = (n) => n >= 100000 ? `${(n/100000).toFixed(1)}L` : `${(n/1000).toFixed(0)}K`;
    if (min && max) return `₹${fmt(min)} - ₹${fmt(max)}`;
    if (min) return `₹${fmt(min)}+`;
    return `Up to ₹${fmt(max)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    if (diff < 30) return `${Math.floor(diff/7)}w ago`;
    return d.toLocaleDateString();
  };

  // Loading skeleton
  const JobSkeleton = () => (
    <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 animate-pulse">
      <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-700/30 rounded w-1/2 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-700/30 rounded-full w-20" />
        <div className="h-6 bg-gray-700/30 rounded-full w-24" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 bg-gray-700/30 rounded-full w-16" />
        <div className="h-5 bg-gray-700/30 rounded-full w-14" />
        <div className="h-5 bg-gray-700/30 rounded-full w-18" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070b13] text-white font-outfit selection:bg-emerald-500/30">
      <Navbar />

      {/* Hero Search */}
      <div className="bg-gradient-to-b from-[#0f172a] to-[#070b13] border-b border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">
            Find Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">Dream Job</span>
          </h1>
          <p className="text-gray-400 text-center mb-8">Discover roles matched to your skills</p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Job title, skills, or keywords..."
                className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
            </div>
            <div className="relative flex-1 sm:max-w-xs">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Location..."
                className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden px-4 py-3.5 bg-[#0f172a] border border-gray-700 rounded-xl text-gray-400 hover:text-white flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </form>

          {/* Filter bar */}
          <div className={`mt-4 flex flex-wrap gap-2 ${showFilters ? '' : 'hidden sm:flex'}`}>
            {employmentTypes.map(t => (
              <button
                key={t.value}
                onClick={() => { setEmploymentType(t.value); setPage(0); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${employmentType === t.value
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#0f172a] text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-gray-200'
                  }`}
              >
                {t.label}
              </button>
            ))}
            {(search || location || employmentType) && (
              <button
                onClick={() => { setSearchInput(''); setSearch(''); setLocation(''); setEmploymentType(''); setPage(0); }}
                className="px-4 py-2 rounded-full text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Job Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <JobSkeleton key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
            description="Try adjusting your search or filters."
          />
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-6">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map(job => (
                <div
                  key={job.id}
                  className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer group relative"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  {/* Save button */}
                  {token && user?.role === 'candidate' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}
                      className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-all"
                    >
                      {savedJobIds.has(job.id)
                        ? <BookmarkCheck className="w-5 h-5 text-emerald-400" />
                        : <Bookmark className="w-5 h-5 text-gray-500 group-hover:text-gray-300" />
                      }
                    </button>
                  )}

                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors pr-10">
                    {job.title}
                  </h3>
                  <p className="text-gray-400 text-sm flex items-center mt-1.5 mb-4">
                    <Building className="w-4 h-4 mr-1.5 opacity-70" />
                    {job.company_name || 'Company'}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-300 mb-4">
                    {job.location && (
                      <span className="flex items-center bg-gray-800/50 px-2.5 py-1 rounded-full">
                        <MapPin className="w-3 h-3 mr-1 text-emerald-400" />
                        {job.location}
                      </span>
                    )}
                    {job.employment_type && (
                      <span className="flex items-center bg-gray-800/50 px-2.5 py-1 rounded-full">
                        <Clock className="w-3 h-3 mr-1 text-emerald-400" />
                        {job.employment_type.replace('_', '-')}
                      </span>
                    )}
                    {formatSalary(job.salary_min, job.salary_max) && (
                      <span className="flex items-center bg-gray-800/50 px-2.5 py-1 rounded-full">
                        <DollarSign className="w-3 h-3 mr-1 text-emerald-400" />
                        {formatSalary(job.salary_min, job.salary_max)}
                      </span>
                    )}
                  </div>

                  {/* Skills */}
                  {(job.skills_required || job.required_skills)?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(job.skills_required || job.required_skills).slice(0, 4).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                      {(job.skills_required || job.required_skills).length > 4 && (
                        <span className="px-2 py-0.5 bg-gray-800/50 text-gray-400 rounded-full text-xs">
                          +{(job.skills_required || job.required_skills).length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {job.created_at && (
                    <p className="text-xs text-gray-500 mt-2">{formatDate(job.created_at)}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-gray-400 text-sm">Page {page + 1}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={jobs.length < limit}
                className="px-4 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
