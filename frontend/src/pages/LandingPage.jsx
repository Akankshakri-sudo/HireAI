import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, FileText, Cpu, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-gray-800/80 bg-[#070b13]/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-extrabold shadow-lg shadow-emerald-500/20">
              H
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              HireAI
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors font-medium">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6 py-20 relative overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto z-10 flex flex-col items-center">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in">
            <Cpu size={14} className="animate-pulse" /> Next-Gen AI Recruitment
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Match Resume & Jobs
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              With Precision AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
            An intelligent ecosystem linking developers and recruiters. Parse resumes with instant ATS feedback, match roles using semantic score analysis, and auto-generate specialized interview questions.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
            <Link
              to="/register?role=candidate"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-bold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <FileText size={18} /> Join as Candidate
            </Link>
            <Link
              to="/register?role=recruiter"
              className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 hover:border-gray-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Briefcase size={18} /> Post a Job as Recruiter
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-28 z-10 w-full">
          {/* Card 1 */}
          <div className="bg-[#0f172a]/60 border border-gray-800/80 p-8 rounded-2xl text-left hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileText size={22} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI Resume Parsing</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Extract technical skills, tools, and background metrics instantly from PDF documents using our lightning-fast parser.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0f172a]/60 border border-gray-800/80 p-8 rounded-2xl text-left hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/5 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Briefcase size={22} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">ATS Matching Engine</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Semantic profile compatibility scoring compares candidate expertise directly to active job posting specifications.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0f172a]/60 border border-gray-800/80 p-8 rounded-2xl text-left hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cpu size={22} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Interview Question AI</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Generate structured Technical, Behavioral, and Coding screening worksheets tailored directly to candidate resume keywords.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-[#070b13] py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} HireAI Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-gray-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">Documentation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
