import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../services/api";
import { User, Lock, Mail, AlertTriangle, ArrowRight, Briefcase } from "lucide-react";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate"); // 'candidate' or 'recruiter'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "candidate" || roleParam === "recruiter") {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Create account
      await authAPI.register(fullName, email, password, role);

      // 2. Automatically log in the user
      const tokenData = await authAPI.login(email, password);
      localStorage.setItem("token", tokenData.access_token);

      const userData = await authAPI.getMe();
      localStorage.setItem("user", JSON.stringify(userData));

      // 3. Redirect to profile setup
      if (userData.role === "recruiter") {
        navigate("/recruiter/profile");
      } else {
        navigate("/candidate/profile");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Registration failed. This email might already be registered."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Card */}
      <div className="w-full max-w-md bg-[#0f172a]/65 border border-gray-800/80 p-10 rounded-3xl backdrop-blur-md shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-extrabold text-lg shadow-lg shadow-emerald-500/20 mb-4 hover:scale-105 transition-transform">
            H
          </Link>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="text-gray-400 text-sm mt-2">Get started with HireAI recruitment ecosystem</p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3 text-rose-400 text-sm">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Role selector */}
          <div>
            <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  role === "candidate"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/5"
                    : "bg-[#070b13]/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white"
                }`}
              >
                <User size={16} /> Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole("recruiter")}
                className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  role === "recruiter"
                    ? "bg-teal-500/10 border-teal-500 text-teal-400 shadow-lg shadow-teal-500/5"
                    : "bg-[#070b13]/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white"
                }`}
              >
                <Briefcase size={16} /> Recruiter
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Password (min. 8 characters)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-emerald-800 disabled:to-teal-800 text-black font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? "Creating account..." : "Sign Up"} <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-gray-400 text-xs text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 hover:underline font-semibold ml-1">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
