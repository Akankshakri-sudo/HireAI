import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Upload, FileText, Briefcase, Sparkles, FileUp, 
  MapPin, Clock, CheckCircle, Search, ClipboardList,
  Calendar, Video, ExternalLink, AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';
import SearchFilters from '../components/SearchFilters';
import ATSRadial from '../components/ATSRadial';
import StatusTimeline from '../components/StatusTimeline';
import JobDetailModal from '../components/JobDetailModal';
import EmptyState from '../components/EmptyState';
import { candidateAPI, applicationsAPI, interviewsAPI } from '../services/api';

export default function CandidateDashboard() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State
  const [profile, setProfile] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'matches');
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['matches', 'applications', 'interviews'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [profileRes, jobsRes, appsRes, interviewsRes] = await Promise.all([
        candidateAPI.getProfile().catch(() => null),
        candidateAPI.getMatchedJobs().catch(() => []),
        applicationsAPI.getMyApplications().catch(() => []),
        interviewsAPI.getCandidateInterviews().catch(() => []),
      ]);
      
      setProfile(profileRes);
      setMatchedJobs(Array.isArray(jobsRes) ? jobsRes : []);
      setApplications(Array.isArray(appsRes) ? appsRes : []);
      setInterviews(Array.isArray(interviewsRes) ? interviewsRes : []);
    } catch (err) {
      showToast('Failed to load dashboard data. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast('Please upload a PDF file.', 'error');
      return;
    }

    try {
      setIsUploading(true);
      showToast('Analyzing your resume...', 'info');
      
      await candidateAPI.uploadResume(file);
      const updatedProfile = await candidateAPI.getProfile();
      setProfile(updatedProfile);
      
      showToast('Resume analyzed successfully!', 'success');
      
      // Refresh matched jobs after new resume upload
      const jobsRes = await candidateAPI.getMatchedJobs();
      setMatchedJobs(Array.isArray(jobsRes) ? jobsRes : []);
      
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to upload resume', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      await applicationsAPI.applyToJob(jobId);
      showToast('Application submitted successfully!', 'success');
      
      const appsRes = await applicationsAPI.getMyApplications();
      setApplications(Array.isArray(appsRes) ? appsRes : []);
      setSelectedJob(null);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to submit application', 'error');
    }
  };

  const isApplied = (jobId) => applications.some(app => app.job_id === jobId);
  const getApplicationStatus = (jobId) => applications.find(app => app.job_id === jobId)?.status;

  // Filter matched jobs
  const filteredJobs = matchedJobs.filter(match => {
    const matchesSearch = !searchQuery || 
      match.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.job_skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesType = !filters.employment_type || 
      match.employment_type === filters.employment_type;
      
    const matchesLocation = !filters.location || 
      match.location?.toLowerCase().includes(filters.location.toLowerCase());

    return matchesSearch && matchesType && matchesLocation;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-outfit">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-white font-outfit selection:bg-emerald-500/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Profile & Resume */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-6 sm:p-8 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
                  <FileText className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Your Profile
                  </h2>
                  <p className="text-gray-400 text-sm">Resume & AI Insights</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Upload Section */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                  <label className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${isUploading ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-gray-700 hover:border-emerald-500/50 hover:bg-[#0f172a]'} rounded-2xl cursor-pointer transition-all duration-300`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isUploading ? (
                        <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
                      ) : (
                        <FileUp className="w-8 h-8 text-gray-400 mb-3 group-hover:text-emerald-400 transition-colors" />
                      )}
                      <p className="text-sm text-gray-300">
                        {isUploading ? 'Analyzing...' : <span className="font-semibold text-emerald-400">Upload new resume</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PDF up to 5MB</p>
                    </div>
                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                </div>

                {/* Profile Stats / Info */}
                {profile?.parsed_data?.skills?.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-gray-800/80">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Extracted Skills ({profile.parsed_data.skills.length})</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.parsed_data.skills.slice(0, 12).map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                      {profile.parsed_data.skills.length > 12 && (
                        <span className="px-2.5 py-1 bg-gray-800/50 text-gray-400 rounded-full text-xs font-medium">
                          +{profile.parsed_data.skills.length - 12} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links / Summary Card */}
            <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Quick Activity</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-800/40 rounded-xl border border-gray-700/50">
                  <p className="text-xs text-gray-400">Applications</p>
                  <p className="text-xl font-bold text-white mt-1">{applications.length}</p>
                </div>
                <div className="p-3 bg-gray-800/40 rounded-xl border border-gray-700/50">
                  <p className="text-xs text-gray-400">Interviews</p>
                  <p className="text-xl font-bold text-purple-400 mt-1">{interviews.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Content Tabs */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 p-1 bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl backdrop-blur-xl">
              <button
                onClick={() => handleTabChange('matches')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'matches' 
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/20 shadow-lg' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Job Matches ({matchedJobs.length})</span>
              </button>
              <button
                onClick={() => handleTabChange('applications')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'applications' 
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/20 shadow-lg' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>My Applications ({applications.length})</span>
              </button>
              <button
                onClick={() => handleTabChange('interviews')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'interviews' 
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/20 shadow-lg' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Interviews ({interviews.length})</span>
              </button>
            </div>

            {/* Matches Tab Content */}
            {activeTab === 'matches' && (
              <div className="animate-[fadeIn_0.3s_ease-out] space-y-6">
                <SearchFilters 
                  onSearch={(q) => setSearchQuery(q)}
                  onFilterChange={(f) => setFilters(f)}
                />

                {filteredJobs.length === 0 ? (
                  <EmptyState 
                    icon={Search}
                    title="No jobs found"
                    description={searchQuery || Object.keys(filters).length > 0 
                      ? "Try adjusting your search or filters to see more results."
                      : "Upload your resume to get AI-powered job matches tailored to your skills."
                    }
                  />
                ) : (
                  <div className="grid gap-4">
                    {filteredJobs.map((match, idx) => {
                      const applied = isApplied(match.job_id);
                      return (
                        <div 
                          key={match.job_id || idx}
                          onClick={() => setSelectedJob(match)}
                          className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-3">
                              <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                  {match.job_title}
                                </h3>
                                <p className="text-gray-400 flex items-center mt-1">
                                  <Briefcase className="w-4 h-4 mr-2 opacity-70" />
                                  {match.company_name || 'Company'}
                                </p>
                              </div>
                              
                              <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                                {match.location && (
                                  <span className="flex items-center bg-gray-800/50 px-3 py-1 rounded-full">
                                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                                    {match.location}
                                  </span>
                                )}
                                {match.employment_type && (
                                  <span className="flex items-center bg-gray-800/50 px-3 py-1 rounded-full">
                                    <Clock className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                                    {match.employment_type.replace('_', '-')}
                                  </span>
                                )}
                              </div>

                              {match.matched_skills?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {match.matched_skills.slice(0, 4).map((skill, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                  {match.matched_skills.length > 4 && (
                                    <span className="px-2 py-0.5 bg-gray-800/50 text-gray-400 rounded-full text-xs">
                                      +{match.matched_skills.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end space-y-3">
                              <ATSRadial score={match.match_score} size="sm" />
                              {applied && (
                                <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                  Applied
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Applications Tab Content */}
            {activeTab === 'applications' && (
              <div className="animate-[fadeIn_0.3s_ease-out] space-y-6">
                {applications.length === 0 ? (
                  <EmptyState 
                    icon={ClipboardList}
                    title="No applications yet"
                    description="When you apply for jobs, your application tracking and status updates will appear here."
                  />
                ) : (
                  <div className="grid gap-6">
                    {applications.map((app, idx) => (
                      <div key={app.application_id || idx} className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-white">{app.job_title}</h3>
                            <p className="text-gray-400 mt-1">Applied on {new Date(app.created_at || Date.now()).toLocaleDateString()}</p>
                          </div>
                          <span className="px-3 py-1 bg-gray-800/80 border border-gray-700 text-gray-300 rounded-full text-sm font-medium capitalize">
                            Status: {app.status}
                          </span>
                        </div>
                        
                        <div className="bg-[#070b13]/50 rounded-xl p-4 border border-gray-800/50">
                          <StatusTimeline currentStatus={app.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Interviews Tab Content */}
            {activeTab === 'interviews' && (
              <div className="animate-[fadeIn_0.3s_ease-out] space-y-6">
                {interviews.length === 0 ? (
                  <EmptyState 
                    icon={Calendar}
                    title="No interviews scheduled yet"
                    description="When recruiters shortlist your profile and set up an interview, it will appear here with the time and meeting details."
                  />
                ) : (
                  <div className="grid gap-4">
                    {interviews.map((iv) => {
                      const isUpcoming = new Date(iv.scheduled_at) > new Date();
                      return (
                        <div key={iv.id} className="bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  {iv.round_name}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                  iv.status === 'completed'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : iv.status === 'cancelled'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-blue-500/20 text-blue-300'
                                }`}>
                                  {iv.status}
                                </span>
                              </div>

                              <h3 className="text-xl font-bold text-white mt-2">{iv.job_title || 'Software Engineering Role'}</h3>
                              <p className="text-gray-400 text-sm">{iv.company_name || 'Hiring Company'}</p>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 mt-4">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4 text-purple-400" />
                                  {new Date(iv.scheduled_at).toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-purple-400" />
                                  {new Date(iv.scheduled_at).toLocaleTimeString(undefined, {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })} ({iv.duration_minutes} mins)
                                </span>
                              </div>

                              {iv.notes && (
                                <p className="text-xs text-gray-400 mt-3 p-2 rounded-lg bg-gray-800/40 border border-gray-700/50">
                                  <span className="font-semibold text-gray-300">Recruiter Notes:</span> {iv.notes}
                                </p>
                              )}
                            </div>

                            {iv.meeting_link && (
                              <a
                                href={iv.meeting_link.startsWith('http') ? iv.meeting_link : `https://${iv.meeting_link}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all self-start sm:self-center"
                              >
                                <Video className="w-4 h-4" />
                                <span>Join Interview</span>
                                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </main>

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
          onApply={() => handleApply(selectedJob.job_id || selectedJob.id)} 
          isApplied={isApplied(selectedJob.job_id || selectedJob.id)} 
          applicationStatus={getApplicationStatus(selectedJob.job_id || selectedJob.id)} 
        />
      )}
    </div>
  );
}
