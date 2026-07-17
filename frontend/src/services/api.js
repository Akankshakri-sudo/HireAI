import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

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
  getJobs: async () => {
    const response = await api.get("/jobs");
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
};

export default api;
