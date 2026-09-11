import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark, MapPin, Clock, Building, Trash2, Briefcase, DollarSign
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import EmptyState from '../components/EmptyState';
import { savedJobsAPI } from '../services/api';
import { useToast } from '../components/Toast';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const data = await savedJobsAPI.getSavedJobs();
      setSavedJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Failed to load saved jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    try {
      await savedJobsAPI.unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(s => s.job_id !== jobId));
      showToast('Job removed from saved', 'info');
    } catch (err) {
      showToast('Failed to unsave job', 'error');
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max)}`;
  };

  const Skeleton = () => (
    <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 animate-pulse">
      <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-700/30 rounded w-1/2 mb-4" />
      <div className="flex gap-2">
        <div className="h-6 bg-gray-700/30 rounded-full w-20" />
        <div className="h-6 bg-gray-700/30 rounded-full w-24" />
      </div>
    </div>
  );

  return (
    <DashboardLayout role="candidate">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Saved Jobs</h1>
            <p className="text-gray-400 text-sm mt-1">{savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}</p>
          </div>
          <Bookmark className="w-6 h-6 text-emerald-400" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : savedJobs.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No saved jobs"
            description="Browse jobs and save ones you're interested in for later."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedJobs.map(sj => (
              <div
                key={sj.id}
                className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer group relative"
                onClick={() => navigate(`/jobs/${sj.job_id}`)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); handleUnsave(sj.job_id); }}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-400" />
                </button>

                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors pr-10">
                  {sj.job_title}
                </h3>
                <p className="text-gray-400 text-sm flex items-center mt-1.5 mb-4">
                  <Building className="w-4 h-4 mr-1.5 opacity-70" />
                  {sj.company_name || 'Company'}
                </p>

                <div className="flex flex-wrap gap-2 text-xs text-gray-300 mb-3">
                  {sj.location && (
                    <span className="flex items-center bg-gray-800/50 px-2.5 py-1 rounded-full">
                      <MapPin className="w-3 h-3 mr-1 text-emerald-400" /> {sj.location}
                    </span>
                  )}
                  {sj.employment_type && (
                    <span className="flex items-center bg-gray-800/50 px-2.5 py-1 rounded-full">
                      <Clock className="w-3 h-3 mr-1 text-emerald-400" /> {sj.employment_type.replace('_', '-')}
                    </span>
                  )}
                  {formatSalary(sj.salary_min, sj.salary_max) && (
                    <span className="flex items-center bg-gray-800/50 px-2.5 py-1 rounded-full">
                      <DollarSign className="w-3 h-3 mr-1 text-emerald-400" /> {formatSalary(sj.salary_min, sj.salary_max)}
                    </span>
                  )}
                </div>

                {sj.skills_required?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {sj.skills_required.slice(0, 4).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3">
                  Saved {new Date(sj.saved_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
