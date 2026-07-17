import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { Lock, Mail, AlertTriangle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Login to get access token
      const tokenData = await authAPI.login(email, password);
      localStorage.setItem("token", tokenData.access_token);

      // 2. Fetch current user info to check their role
      const userData = await authAPI.getMe();
      localStorage.setItem("user", JSON.stringify(userData));

      // 3. Redirect based on role
      if (userData.role === "recruiter") {
        navigate("/recruiter/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Invalid email or password. Please try again."
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

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#0f172a]/65 border border-gray-800/80 p-10 rounded-3xl backdrop-blur-md shadow-2xl relative z-10">
        {/* Title */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-extrabold text-lg shadow-lg shadow-emerald-500/20 mb-4 hover:scale-105 transition-transform">
            H
          </Link>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-2">Enter credentials to log in to HireAI</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3 text-rose-400 text-sm animate-shake">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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
                placeholder="developer@hireai.com"
                className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Password
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
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-emerald-800 disabled:to-teal-800 text-black font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? "Logging in..." : "Log In"} <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-gray-400 text-xs text-center mt-8">
          Don't have an account?{" "}
          <Link to="/register" className="text-emerald-400 hover:underline font-semibold ml-1">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}
