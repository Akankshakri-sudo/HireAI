import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Briefcase, User as UserIcon, LayoutDashboard, Bookmark, Sparkles } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800/80 bg-[#070b13]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-extrabold shadow-lg shadow-emerald-500/20">
            H
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            HireAI
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/jobs"
            className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/jobs') ? 'text-emerald-400' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Find Jobs</span>
          </Link>

          {user ? (
            <>
              {user.role === "candidate" && (
                <>
                  <Link
                    to="/candidate/dashboard"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/candidate/dashboard') ? 'text-emerald-400' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/candidate/saved-jobs"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/candidate/saved-jobs') ? 'text-emerald-400' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Saved Jobs
                  </Link>
                  <Link
                    to="/candidate/profile"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/candidate/profile') ? 'text-emerald-400' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Profile
                  </Link>
                </>
              )}

              {user.role === "recruiter" && (
                <>
                  <Link
                    to="/recruiter/dashboard"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/recruiter/dashboard') ? 'text-emerald-400' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Recruiter Hub
                  </Link>
                  <Link
                    to="/recruiter/profile"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/recruiter/profile') ? 'text-emerald-400' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Company Profile
                  </Link>
                </>
              )}

              {user.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/admin/dashboard') ? 'text-emerald-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Admin Console
                </Link>
              )}

              <div className="h-4 w-px bg-gray-800" />

              <NotificationDropdown />

              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-[#0f172a] border border-gray-800 text-xs font-medium text-gray-300">
                  {user.full_name || user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-rose-400 text-sm font-medium transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors font-medium text-sm">
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-semibold px-4 py-2 text-sm rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu right side */}
        <div className="flex md:hidden items-center gap-2">
          {user && <NotificationDropdown />}
          <button
            className="text-gray-400 hover:text-white cursor-pointer p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f172a] border-b border-gray-800 shadow-2xl flex flex-col p-4 gap-2 z-40">
          <Link
            to="/jobs"
            className={`p-3 rounded-xl font-medium text-sm ${isActive('/jobs') ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-300'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Find Jobs
          </Link>

          {user ? (
            <>
              {user.role === "candidate" && (
                <>
                  <Link
                    to="/candidate/dashboard"
                    className={`p-3 rounded-xl font-medium text-sm ${isActive('/candidate/dashboard') ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-300'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/candidate/saved-jobs"
                    className={`p-3 rounded-xl font-medium text-sm ${isActive('/candidate/saved-jobs') ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-300'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Saved Jobs
                  </Link>
                  <Link
                    to="/candidate/profile"
                    className={`p-3 rounded-xl font-medium text-sm ${isActive('/candidate/profile') ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-300'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              )}

              {user.role === "recruiter" && (
                <>
                  <Link
                    to="/recruiter/dashboard"
                    className={`p-3 rounded-xl font-medium text-sm ${isActive('/recruiter/dashboard') ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-300'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Recruiter Hub
                  </Link>
                  <Link
                    to="/recruiter/profile"
                    className={`p-3 rounded-xl font-medium text-sm ${isActive('/recruiter/profile') ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-300'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Company Profile
                  </Link>
                </>
              )}

              {user.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className={`p-3 rounded-xl font-medium text-sm ${isActive('/admin/dashboard') ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-300'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Console
                </Link>
              )}

              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="text-left p-3 rounded-xl text-rose-400 font-medium text-sm"
              >
                Sign Out ({user.email})
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="p-3 rounded-xl text-gray-300 font-medium text-sm" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold p-3 rounded-xl text-center text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
