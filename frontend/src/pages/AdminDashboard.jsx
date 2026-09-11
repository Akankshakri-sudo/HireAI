import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Briefcase,
  ClipboardList,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Power,
  Filter,
  TrendingUp,
  UserCheck,
  Building,
  RefreshCw,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import EmptyState from '../components/EmptyState';
import ATSRadial from '../components/ATSRadial';
import { adminAPI } from '../services/api';
import { useToast } from '../components/Toast';

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [jobSearch, setJobSearch] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const data = await adminAPI.getStats();
      setStats(data);
    } catch {
      showToast('Failed to load platform stats', 'error');
    }
  }, [showToast]);

  const fetchUsers = useCallback(async () => {
    try {
      const params = {};
      if (userSearch) params.search = userSearch;
      if (userRoleFilter) params.role = userRoleFilter;
      const data = await adminAPI.getUsers(params);
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load users', 'error');
    }
  }, [userSearch, userRoleFilter, showToast]);

  const fetchJobs = useCallback(async () => {
    try {
      const params = {};
      if (jobSearch) params.search = jobSearch;
      const data = await adminAPI.getJobs(params);
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load jobs', 'error');
    }
  }, [jobSearch, showToast]);

  const fetchApplications = useCallback(async () => {
    try {
      const data = await adminAPI.getApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load applications', 'error');
    }
  }, [showToast]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchJobs(), fetchApplications()]);
    setLoading(false);
  }, [fetchStats, fetchUsers, fetchJobs, fetchApplications]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Actions
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, !currentStatus);
      showToast(`User account ${!currentStatus ? 'activated' : 'deactivated'}`, 'success');
      fetchUsers();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"?`)) return;
    try {
      await adminAPI.deleteUser(userId);
      showToast('User deleted successfully', 'success');
      fetchUsers();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete user', 'error');
    }
  };

  const handleToggleJobStatus = async (jobId) => {
    try {
      const res = await adminAPI.toggleJobStatus(jobId);
      showToast(res.message || 'Job status updated', 'success');
      fetchJobs();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to toggle job', 'error');
    }
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to delete job listing "${jobTitle}"?`)) return;
    try {
      await adminAPI.deleteJob(jobId);
      showToast('Job listing deleted', 'success');
      fetchJobs();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete job', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-white font-outfit selection:bg-emerald-500/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Admin Console
                </h1>
                <p className="text-gray-400 text-sm">Platform control, user management, and system metrics</p>
              </div>
            </div>
          </div>

          <button
            onClick={loadAll}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0f172a] border border-gray-800 rounded-xl text-gray-300 hover:text-white hover:border-gray-700 transition-all text-sm font-medium self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-5">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Total Users</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.total_users}</p>
              <div className="flex gap-2 text-xs text-gray-500 mt-2">
                <span>{stats.total_candidates} candidates</span>
                <span>•</span>
                <span>{stats.total_recruiters} recruiters</span>
              </div>
            </div>

            <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-5">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Active Jobs</span>
                <Briefcase className="w-4 h-4 text-teal-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.active_jobs}</p>
              <p className="text-xs text-gray-500 mt-2">{stats.total_jobs} total listings created</p>
            </div>

            <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-5">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Applications</span>
                <ClipboardList className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.total_applications}</p>
              <p className="text-xs text-gray-500 mt-2">
                {stats.recent_applications_count_7d} submitted past 7d
              </p>
            </div>

            <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-5">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">New Users (7d)</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.recent_users_count_7d}</p>
              <p className="text-xs text-gray-500 mt-2">Platform growth rate</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 p-1 bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl backdrop-blur-xl mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            Overview & Breakdown
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'jobs'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            Job Listings ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'applications'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            Applications ({applications.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Application Status Funnel</h3>
              <div className="space-y-4">
                {Object.entries(stats.status_breakdown || {}).map(([status, count]) => {
                  const pct = stats.total_applications > 0 ? Math.round((count / stats.total_applications) * 100) : 0;
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="capitalize text-gray-300">{status}</span>
                        <span className="text-gray-400 font-medium">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            status === 'hired'
                              ? 'bg-emerald-500'
                              : status === 'interview'
                              ? 'bg-purple-500'
                              : status === 'shortlisted'
                              ? 'bg-blue-500'
                              : status === 'rejected'
                              ? 'bg-rose-500'
                              : 'bg-teal-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Platform Distribution</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/50">
                  <p className="text-sm text-gray-400">Candidates</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.total_candidates}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/50">
                  <p className="text-sm text-gray-400">Recruiters</p>
                  <p className="text-2xl font-bold text-teal-400 mt-1">{stats.total_recruiters}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/50">
                  <p className="text-sm text-gray-400">Active Job Ratio</p>
                  <p className="text-2xl font-bold text-purple-400 mt-1">
                    {stats.total_jobs > 0 ? `${Math.round((stats.active_jobs / stats.total_jobs) * 100)}%` : '0%'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/50">
                  <p className="text-sm text-gray-400">Avg Apps / Job</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    {stats.total_jobs > 0 ? (stats.total_applications / stats.total_jobs).toFixed(1) : '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Users */}
        {activeTab === 'users' && (
          <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 space-y-6">
            {/* Search & filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  className="w-full pl-10 pr-4 py-2 bg-[#070b13] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setTimeout(fetchUsers, 50);
                }}
                className="px-4 py-2 bg-[#070b13] border border-gray-700 rounded-xl text-sm text-white focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="candidate">Candidate</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="pb-3 px-4">User</th>
                    <th className="pb-3 px-4">Role</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4">Joined</th>
                    <th className="pb-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{u.full_name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : u.role === 'recruiter'
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.is_active ? (
                          <span className="flex items-center text-xs text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center text-xs text-rose-400">
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              u.is_active
                                ? 'border-gray-700 text-gray-400 hover:text-amber-400 hover:border-amber-400/50'
                                : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                            title={u.is_active ? 'Deactivate user' : 'Activate user'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.full_name)}
                            className="p-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-rose-400 hover:border-rose-400/50 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Jobs */}
        {activeTab === 'jobs' && (
          <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 space-y-6">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search job title or location..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                className="w-full pl-10 pr-4 py-2 bg-[#070b13] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="pb-3 px-4">Job Title</th>
                    <th className="pb-3 px-4">Company</th>
                    <th className="pb-3 px-4">Recruiter</th>
                    <th className="pb-3 px-4">Apps</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {jobs.map((j) => (
                    <tr key={j.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-semibold text-white">{j.title}</td>
                      <td className="py-3.5 px-4 text-gray-300">{j.company_name || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-xs text-gray-400">{j.recruiter_name || j.recruiter_email || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-gray-300 font-medium">{j.applications_count}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            j.is_active
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {j.is_active ? 'Active' : 'Closed'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleJobStatus(j.id)}
                            className="p-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-colors"
                            title="Toggle active status"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(j.id, j.title)}
                            className="p-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-rose-400 hover:border-rose-400/50 transition-colors"
                            title="Delete job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Applications */}
        {activeTab === 'applications' && (
          <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="pb-3 px-4">Candidate</th>
                    <th className="pb-3 px-4">Job</th>
                    <th className="pb-3 px-4">Match Score</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4">Applied Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{app.candidate_name}</p>
                        <p className="text-xs text-gray-400">{app.candidate_email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-white">{app.job_title}</p>
                        <p className="text-xs text-gray-400">{app.company_name}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <ATSRadial score={app.ai_match_score} size="sm" />
                          <span className="text-xs font-semibold text-emerald-400">{app.ai_match_score}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-gray-800 text-gray-300 border border-gray-700">
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-400">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
