import React, { useState, useEffect } from 'react';
import { getStoredUser } from '../utils/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Search, ClipboardList, Bookmark,
  FileText, User, Briefcase, PlusCircle, LogOut,
  ChevronLeft, ChevronRight, Menu, X, Sparkles
} from 'lucide-react';

const candidateMenuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/candidate/dashboard' },
  { label: 'Find Jobs', icon: Search, path: '/jobs' },
  { label: 'My Applications', icon: ClipboardList, path: '/candidate/dashboard?tab=applications' },
  { label: 'Saved Jobs', icon: Bookmark, path: '/candidate/saved-jobs' },
  { label: 'Profile', icon: User, path: '/candidate/profile' },
];

const recruiterMenuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/recruiter/dashboard' },
  { label: 'Post Job', icon: PlusCircle, path: '/recruiter/dashboard?action=new' },
  { label: 'My Jobs', icon: Briefcase, path: '/recruiter/dashboard?tab=jobs' },
  { label: 'Profile', icon: User, path: '/recruiter/profile' },
];

export default function Sidebar({ role = 'candidate' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = getStoredUser();

  const menuItems = role === 'recruiter' ? recruiterMenuItems : candidateMenuItems;

  const isActive = (path) => {
    const basePath = path.split('?')[0];
    return location.pathname === basePath;
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center px-4 py-5 border-b border-gray-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="ml-3 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
            HireAI
          </span>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${active
                  ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-800/80 p-3">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#0a0f1a] border border-gray-800 rounded-xl text-gray-400 hover:text-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="w-64 h-full bg-[#0a0f1a] border-r border-gray-800/80" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-[#0a0f1a] border-r border-gray-800/80 transition-all duration-300 z-30
        ${collapsed ? 'w-16' : 'w-60'}`}
      >
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#0f172a] border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-emerald-500/50 transition-all"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
}
