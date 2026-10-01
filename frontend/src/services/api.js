import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry / auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (fullName, email, password, role) => {
    const response = await api.post("/auth/register", {
      full_name: fullName,
      email,
      password,
      role,
    });
    return response.data;
  },
  login: async (email, password) => {
    // OAuth2PasswordRequestForm expects x-www-form-urlencoded data
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const response = await api.post("/auth/login", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data; // returns { access_token, token_type }
  },
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export const candidateAPI = {
  getProfile: async () => {
    const response = await api.get("/candidate/profile");
    return response.data;
  },
  createProfile: async (profileData) => {
    const response = await api.post("/candidate/profile", profileData);
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put("/candidate/profile", profileData);
    return response.data;
  },
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/candidate/resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  parseResume: async () => {
    const response = await api.post("/candidate/resume/parse");
    return response.data;
  },
  analyzeResume: async () => {
    const response = await api.post("/candidate/resume/analyze");
    return response.data;
  },
  getResumeAnalysis: async () => {
    const response = await api.get("/candidate/resume/analysis");
    return response.data;
  },
  calculateScore: async (jobDescription) => {
    const response = await api.post("/candidate/resume/score", {
      job_description: jobDescription,
    });
    return response.data;
  },
  getMatchedJobs: async () => {
    const response = await api.get("/candidate/matched-jobs");
    return response.data;
  },
};

export const recruiterAPI = {
  getProfile: async () => {
    const response = await api.get("/recruiter/profile");
    return response.data;
  },
  createProfile: async (companyId, designation, phone) => {
    const response = await api.post("/recruiter/profile", {
      company_id: companyId,
      designation,
      phone,
    });
    return response.data;
  },
  updateProfile: async (companyId, designation, phone) => {
    const response = await api.put("/recruiter/profile", {
      company_id: companyId,
      designation,
      phone,
    });
    return response.data;
  },
  createCompany: async (companyData) => {
    const response = await api.post("/recruiter/company", companyData);
    return response.data;
  },
  updateCompany: async (companyId, companyData) => {
    const response = await api.put(`/recruiter/company/${companyId}`, companyData);
    return response.data;
  },
  getCompanies: async () => {
    const response = await api.get("/recruiter/companies");
    return response.data;
  },
};

export const jobsAPI = {
  createJob: async (jobData) => {
    const response = await api.post("/jobs", jobData);
    return response.data;
  },
  getJobs: async (params = {}) => {
    const response = await api.get("/jobs", { params });
    return response.data;
  },
  getJobById: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },
  matchJob: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/match`);
    return response.data;
  },
  updateJob: async (jobId, jobData) => {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response.data;
  },
  deleteJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  },
  getRecruiterJobs: async () => {
    const response = await api.get("/jobs/my");
    return response.data;
  },
};

export const applicationsAPI = {
  applyToJob: async (jobId) => {
    const response = await api.post(`/applications/${jobId}`);
    return response.data;
  },
  getMyApplications: async () => {
    const response = await api.get("/applications/my");
    return response.data;
  },
  getJobApplicants: async (jobId) => {
    const response = await api.get(`/applications/jobs/${jobId}`);
    return response.data;
  },
  updateStatus: async (applicationId, status) => {
    const response = await api.put(`/applications/${applicationId}/status?status=${status}`);
    return response.data;
  },
  generateQuestions: async (applicationId) => {
    const response = await api.post(`/applications/${applicationId}/interview-questions`);
    return response.data;
  },
  getRecruiterStats: async () => {
    const response = await api.get("/applications/stats");
    return response.data;
  },
};
export const savedJobsAPI = {
  saveJob: async (jobId) => {
    const response = await api.post(`/saved-jobs/${jobId}`);
    return response.data;
  },
  unsaveJob: async (jobId) => {
    const response = await api.delete(`/saved-jobs/${jobId}`);
    return response.data;
  },
  getSavedJobs: async () => {
    const response = await api.get("/saved-jobs");
    return response.data;
  },
};

export const notificationsAPI = {
  getMyNotifications: async (limit = 30) => {
    const response = await api.get(`/notifications?limit=${limit}`);
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  },
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put("/notifications/read-all");
    return response.data;
  },
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },
};

export const interviewsAPI = {
  scheduleInterview: async (data) => {
    const response = await api.post("/interviews", data);
    return response.data;
  },
  getCandidateInterviews: async () => {
    const response = await api.get("/interviews/candidate");
    return response.data;
  },
  getRecruiterInterviews: async () => {
    const response = await api.get("/interviews/recruiter");
    return response.data;
  },
  updateInterviewStatus: async (interviewId, data) => {
    const response = await api.put(`/interviews/${interviewId}/status`, data);
    return response.data;
  },
};

export const adminAPI = {
  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },
  getUsers: async (params = {}) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },
  updateUserStatus: async (userId, isActive) => {
    const response = await api.put(`/admin/users/${userId}/status`, { is_active: isActive });
    return response.data;
  },
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  getJobs: async (params = {}) => {
    const response = await api.get("/admin/jobs", { params });
    return response.data;
  },
  toggleJobStatus: async (jobId) => {
    const response = await api.put(`/admin/jobs/${jobId}/toggle-status`);
    return response.data;
  },
  deleteJob: async (jobId) => {
    const response = await api.delete(`/admin/jobs/${jobId}`);
    return response.data;
  },
  getApplications: async (params = {}) => {
    const response = await api.get("/admin/applications", { params });
    return response.data;
  },
};

export default api;

