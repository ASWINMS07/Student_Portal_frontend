import { useState } from 'react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'attendance', label: 'Attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { id: 'marks', label: 'Marks', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'fees', label: 'Fees Status', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'courses', label: 'Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'timetable', label: 'Timetable', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

export default function DashboardLayout({ activePage, onPageChange, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = JSON.parse(localStorage.getItem('authData') || '{}').name || 'Student';

  const handleNavClick = (pageId) => {
    onPageChange(pageId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] text-slate-800 font-['Poppins'] selection:bg-indigo-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-full w-72 bg-white border-r border-slate-100 shadow-xl shadow-slate-200/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="h-24 flex items-center gap-3 px-8">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Scholarly</span>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 space-y-8">
          <div className="space-y-2">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Main Menu</p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 group ${activePage === item.id
                    ? 'text-slate-900 font-bold bg-slate-50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
              >
                <svg
                  className={`w-5 h-5 transition-colors ${activePage === item.id ? 'text-slate-900 stroke-[2.5px]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activePage === item.id ? 2.5 : 2} d={item.icon} />
                </svg>
                {item.label}
              </button>
            ))}
          </div>

          {/* Quick Add Section (Visual Mockup from Design) */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
            <div className="flex -space-x-2 justify-center mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-rose-100 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white"></div>
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Studying Now</h4>
            <p className="text-xs text-slate-500 mb-4">Join your classmates</p>
            <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:scale-[1.02] transition-all">
              View &rarr;
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="absolute bottom-8 left-0 right-0 px-8">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 text-slate-500 hover:text-rose-500 transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="lg:ml-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-24 sticky top-0 z-20 px-6 lg:px-10 flex items-center justify-between bg-[#F5F7F8]/80 backdrop-blur-xl">
          {/* Search */}
          <div className="flex items-center gap-4 w-full max-w-xl">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            <div className="relative hidden md:block w-full max-w-sm">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search here..."
                className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-full text-sm font-medium text-slate-600 shadow-sm focus:ring-2 focus:ring-slate-200 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-6">
            <button className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-all text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                {userName.charAt(0)}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-slate-900">{userName}</p>
                <p className="text-xs text-slate-400 font-medium">Student</p>
              </div>
              <svg className="w-4 h-4 text-slate-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 px-6 lg:px-10 pb-10 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
