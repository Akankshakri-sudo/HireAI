import React from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, role = 'candidate' }) {
  return (
    <div className="min-h-screen bg-[#070b13] text-white font-outfit">
      <Sidebar role={role} />
      {/* Main content offset by sidebar width */}
      <main className="lg:ml-60 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
