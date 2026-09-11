import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';
import EditJobModal from '../components/EditJobModal';
import EmptyState from '../components/EmptyState';
import { recruiterAPI, jobsAPI, applicationsAPI } from '../services/api';
import { 
  Plus, Briefcase, Users, Building, MapPin, 
  Clock, ChevronRight, TrendingUp, AlertCircle, 
  Check, UserCheck, Award, Pencil, Trash2, X, Search
} from 'lucide-react';

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    selected: 0
  });
  const [loading, setLoading] = useState(true);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    description: '',
    requirements: '',
    skills: '',
    salary: ''
  });
  const [editingJob, setEditingJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Assuming jobsAPI.getRecruiterJobs or similar fetches jobs for this recruiter
      const [jobsRes, statsRes] = await Promise.all([
        jobsAPI.getJobs(), // Might need recruiter-specific endpoint if available, falling back to generic
        applicationsAPI.getRecruiterStats()
      ]);
      setJobs(Array.isArray(jobsRes) ? jobsRes : []);
      const s = statsRes || {};
      setStats({
        totalJobs: s.total_jobs ?? 0,
        totalApplicants: s.total_applicants ?? 0,
        shortlisted: s.shortlisted ?? 0,
        selected: s.selected ?? 0
      });
    } catch (error) {
      showToast('Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const skills = jobForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      const formattedData = {
        title: jobForm.title,
        description: jobForm.description || 'Job description pending.',
        location: jobForm.location || null,
        employment_type: jobForm.type || 'full_time',
        skills_required: skills,
        minimum_experience: 0,
        salary_min: jobForm.salary ? parseInt(jobForm.salary) : null,
        salary_max: null,
      };
      await jobsAPI.createJob(formattedData);
      showToast('Job posted successfully!', 'success');
      setShowNewJobModal(false);
      setJobForm({ title: '', company: '', location: '', type: 'Full-time', description: '', requirements: '', skills: '', salary: '' });
      fetchDashboardData();
    } catch (error) {
      showToast(error.response?.data?.detail || 'Failed to post job', 'error');
    }
  };

  const handleUpdateJob = async (jobId, data) => {
    try {
      await jobsAPI.updateJob(jobId, data);
      showToast('Job updated successfully!', 'success');
      setEditingJob(null);
      fetchDashboardData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update job', 'error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Delete this job?')) {
      try {
        await jobsAPI.deleteJob(jobId);
        showToast('Job deleted successfully!', 'success');
        fetchDashboardData();
      } catch (error) {
        showToast('Failed to delete job', 'error');
      }
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    job.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#070b13] text-white font-['Outfit']">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
              Recruiter Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Manage your job postings and applicants.</p>
          </div>
          <button
            onClick={() => setShowNewJobModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Post New Job
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'text-teal-400', bg: 'bg-teal-400/10' },
            { label: 'Total Applicants', value: stats.totalApplicants, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Shortlisted', value: stats.shortlisted, icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Selected', value: stats.selected, icon: Award, color: 'text-purple-400', bg: 'bg-purple-400/10' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-semibold">Your Job Postings</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-[#0f172a]/60 border border-gray-800/80 rounded-xl focus:outline-none focus:border-teal-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState 
            title="No jobs found" 
            description={searchQuery ? "No jobs match your search query." : "You haven't posted any jobs yet. Click 'Post New Job' to get started."} 
            icon={Briefcase} 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div key={job._id || job.id} className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 hover:border-teal-500/30 transition-colors flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <p className="text-teal-400 text-sm font-medium">{job.company}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                    {job.status || 'Active'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4 flex-grow">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{job.applicantCount || 0} Applicants</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {(job.skills || []).slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-800/50 rounded-lg text-xs text-gray-300">
                      {skill}
                    </span>
                  ))}
                  {(job.skills?.length > 3) && (
                    <span className="px-2 py-1 bg-gray-800/50 rounded-lg text-xs text-gray-300">
                      +{job.skills.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-800/50">
                  <button 
                    onClick={() => navigate(`/recruiter/jobs/${job._id || job.id}`)}
                    className="flex-1 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-xl text-sm font-medium transition-colors"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => setEditingJob(job)}
                    className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-colors"
                    title="Edit Job"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteJob(job._id || job.id)}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* New Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0f172a] border border-gray-800/80 rounded-3xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-800/80">
              <h2 className="text-xl font-bold">Post a New Job</h2>
              <button 
                onClick={() => setShowNewJobModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Job Title</label>
                  <input
                    required
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                    className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                  <input
                    required
                    type="text"
                    value={jobForm.company}
                    onChange={(e) => setJobForm({...jobForm, company: e.target.value})}
                    className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                  <input
                    required
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                    className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Job Type</label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm({...jobForm, type: e.target.value})}
                    className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500/50"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Salary Range (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. $80,000 - $120,000"
                  value={jobForm.salary}
                  onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                  className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Required Skills (Comma separated)</label>
                <input
                  required
                  type="text"
                  placeholder="React, Node.js, TypeScript"
                  value={jobForm.skills}
                  onChange={(e) => setJobForm({...jobForm, skills: e.target.value})}
                  className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Job Description</label>
                <textarea
                  required
                  rows={4}
                  value={jobForm.description}
                  onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                  className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500/50 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewJobModal(false)}
                  className="px-6 py-2.5 bg-gray-800/50 hover:bg-gray-800 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <EditJobModal
          job={editingJob}
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          onSave={handleUpdateJob}
        />
      )}
    </div>
  );
};

export default RecruiterDashboard;
