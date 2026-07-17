import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { candidateAPI } from "../services/api";
import { ArrowLeft, User, Phone, BookOpen, Calendar, Settings, FileText, Check } from "lucide-react";

export default function CandidateProfile() {
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [hasProfile, setHasProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await candidateAPI.getProfile();
        if (profile) {
          setPhone(profile.phone || "");
          setCollege(profile.college || "");
          setDegree(profile.degree || "");
          setGraduationYear(profile.graduation_year || "");
          setSkills(profile.skills || "");
          setExperience(profile.experience || "");
          setHasProfile(true);
        }
      } catch (err) {
        // 404 is expected if profile is not created yet
        if (err.response?.status !== 404) {
          console.error(err);
          setError("Failed to load profile details.");
        }
      } finally {
        setFetching(false);
      }
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const profileData = {
      phone: phone || null,
      college: college || null,
      degree: degree || null,
      graduation_year: graduationYear ? parseInt(graduationYear) : null,
      skills: skills || null,
      experience: experience || null,
    };

    try {
      if (hasProfile) {
        await candidateAPI.updateProfile(profileData);
      } else {
        await candidateAPI.createProfile(profileData);
        setHasProfile(true);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate("/candidate/dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Failed to save profile. Please check input values."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 border-r-2" />
        <span className="ml-3">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-gray-800/80 bg-[#070b13]/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/candidate/dashboard")}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="font-bold text-lg text-white">Edit Candidate Profile</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-rose-400 text-sm font-medium transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-3xl p-8 backdrop-blur-md shadow-xl">
          {/* Header Info */}
          <div className="mb-8 pb-6 border-b border-gray-800/80">
            <h2 className="text-2xl font-extrabold text-white">Professional Profile</h2>
            <p className="text-gray-400 text-sm mt-1">
              Add your contact info and expertise to calculate exact matching scores against job requirements.
            </p>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
              <Check size={18} className="shrink-0" />
              <span>Profile updated successfully! Redirecting to dashboard...</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
              <span className="shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone */}
              <div>
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* College */}
              <div>
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  College / University
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                    <BookOpen size={16} />
                  </span>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Stanford University"
                    className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Degree */}
              <div>
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  Degree / Program
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                    <BookOpen size={16} />
                  </span>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="B.S. in Computer Science"
                    className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Graduation Year */}
              <div>
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  Graduation Year
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                    <Calendar size={16} />
                  </span>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="2025"
                    className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Technical Skills */}
            <div>
              <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Technical Skills (Comma separated)
              </label>
              <div className="relative">
                <span className="absolute top-3 left-4 text-gray-500">
                  <Settings size={16} />
                </span>
                <textarea
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="python, javascript, react, fastapi, docker, postgresql"
                  rows={2}
                  className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all resize-none"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Tip: Enter standard lowercase names to ensure perfect matching with job specifications.
              </p>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Professional Experience Description
              </label>
              <div className="relative">
                <span className="absolute top-3 left-4 text-gray-500">
                  <FileText size={16} />
                </span>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Built scalable APIs using FastAPI. Developed responsive frontends in React with Tailwind CSS. Managed AWS serverless deployment pipeline."
                  rows={4}
                  className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4 border-t border-gray-800/80">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-emerald-800 disabled:to-teal-800 text-black font-bold px-8 py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-all cursor-pointer"
              >
                {loading ? "Saving details..." : "Save Profile Details"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/candidate/dashboard")}
                className="bg-gray-850 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-300 font-bold px-6 py-3.5 rounded-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
