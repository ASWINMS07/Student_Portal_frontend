import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  getAttendanceForStudent,
  getMarksForStudent,
  getStudentFees,
  getCoursesForStudent,
  getTimetableForStudent,
  getProfileForStudent,
  updateProfile,
  seedAPI // Import seedAPI
} from '../services/api';
import { getAuthData } from '../utils/auth';

// ==========================================
// 1. DASHBOARD HOME (Bento Grid)
// ==========================================
function DashboardHome() {
  const [stats, setStats] = useState({
    attendance: { value: 0, label: 'Attendance Rate' },
    marks: { value: 0, label: 'Course Progress' },
    assignments: { value: 64, label: 'Assignments' },
    fees: { value: 0, label: 'Pending Fees' }
  });
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading dashboard...');
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const storedAuth = getAuthData();
        const studentId = storedAuth.studentId;

        const [att, marksData, feesData] = await Promise.all([
          getAttendanceForStudent(studentId),
          getMarksForStudent(studentId),
          getStudentFees()
        ]);

        let courseProgress = 0;
        if (marksData.semesters && marksData.semesters.length > 0) {
          courseProgress = marksData.semesters[marksData.semesters.length - 1].percentage || 0;
        }

        setStats({
          attendance: { value: att.overall?.percentage || 0, label: 'Attendance Rate' },
          marks: { value: courseProgress, label: 'Course Progress' },
          assignments: { value: 64, label: 'Assignments' },
          fees: { value: feesData.summary?.pendingAmount || 0, label: 'Pending Fees' }
        });
      } catch (err) {
        console.error('Summary error:', err);
        setLoadingMsg('Failed to load data. Please try seeding if DB is empty.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    setSeedMessage({ type: '', text: '' });
    try {
      const result = await seedAPI.seedData();
      setSeedMessage({ type: 'success', text: 'Database seeded successfully! Reloading...' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setSeedMessage({ type: 'error', text: err.message });
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400 font-medium animate-pulse">{loadingMsg}</div>;

  return (
    <div className="space-y-8 animate-fade-in font-['Poppins']">

      {/* Header / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium">Welcome back to your student portal.</p>
        </div>

        {/* Seed Button for Demo */}
        <div className="flex items-center gap-3">
          {seedMessage.text && (
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${seedMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {seedMessage.text}
            </span>
          )}
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {seeding ? 'Seeding...' : 'Seed Data'}
          </button>
        </div>
      </div>

      {/* Bento Grid - Top Section (KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1: Course Progress (Yellow) */}
        <div className="bg-[#FFF9C4] rounded-[32px] p-8 relative overflow-hidden group transition-transform hover:scale-[1.02] duration-300 shadow-sm border border-yellow-100">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center text-yellow-600 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <button className="p-2 rounded-full hover:bg-white/40 transition-colors text-yellow-700/70">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
            </button>
          </div>
          <div>
            <p className="text-yellow-800 font-bold text-sm uppercase tracking-wide mb-1 opacity-80">Course Progress</p>
            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="text-5xl font-bold text-slate-900">{stats.marks.value}%</h2>
              <span className="px-2.5 py-1 rounded-full bg-white/50 text-xs font-bold text-yellow-800 border border-yellow-200">
                +12%
              </span>
            </div>
            <p className="text-yellow-900/60 text-sm font-medium">22 out of 64 classes completed</p>
            <button className="mt-8 px-5 py-2.5 bg-white/80 hover:bg-white text-yellow-900 text-sm font-bold rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2 group-hover:px-6">
              See Details <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>

        {/* Card 2: Attendance (Pink) */}
        <div className="bg-[#FFEBEE] rounded-[32px] p-8 relative overflow-hidden group transition-transform hover:scale-[1.02] duration-300 shadow-sm border border-rose-100">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center text-rose-500 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <button className="p-2 rounded-full hover:bg-white/40 transition-colors text-rose-700/70">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
            </button>
          </div>
          <div>
            <p className="text-rose-800 font-bold text-sm uppercase tracking-wide mb-1 opacity-80">Attendance Rate</p>
            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="text-5xl font-bold text-slate-900">{stats.attendance.value}%</h2>
              <span className="px-2.5 py-1 rounded-full bg-white/50 text-xs font-bold text-rose-800 border border-rose-200">
                -02%
              </span>
            </div>
            <p className="text-rose-900/60 text-sm font-medium">Based on total student avg</p>
            <button className="mt-8 px-5 py-2.5 bg-white/80 hover:bg-white text-rose-900 text-sm font-bold rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2 group-hover:px-6">
              See Details <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>

        {/* Card 3: Assignments (Lavender) */}
        <div className="bg-[#F3E5F5] rounded-[32px] p-8 relative overflow-hidden group transition-transform hover:scale-[1.02] duration-300 shadow-sm border border-purple-100">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center text-purple-600 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <button className="p-2 rounded-full hover:bg-white/40 transition-colors text-purple-700/70">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
            </button>
          </div>
          <div>
            <p className="text-purple-800 font-bold text-sm uppercase tracking-wide mb-1 opacity-80">Assignments</p>
            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="text-5xl font-bold text-slate-900">{stats.assignments.value}%</h2>
              <span className="px-2.5 py-1 rounded-full bg-white/50 text-xs font-bold text-purple-800 border border-purple-200">
                +18%
              </span>
            </div>
            <p className="text-purple-900/60 text-sm font-medium">Based on recent tasks</p>
            <button className="mt-8 px-5 py-2.5 bg-white/80 hover:bg-white text-purple-900 text-sm font-bold rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2 group-hover:px-6">
              See Details <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average GPA / Marks Chart */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100/60">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg">Performance History</h3>
            <div className="flex items-center gap-2 bg-slate-50 rounded-full p-1 border border-slate-100">
              <button className="px-4 py-1.5 rounded-full bg-white text-xs font-bold shadow-sm text-slate-800 border border-slate-100">Semesters</button>
              <button className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-400 hover:text-slate-600">Monthly</button>
            </div>
          </div>
          {/* Simple Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-4 px-4 pb-2">
            {[65, 78, 45, 82, 91, 74].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-3 flex-1 group cursor-pointer">
                <div className="w-full max-w-[48px] bg-slate-50 rounded-t-2xl relative h-64 flex items-end overflow-hidden">
                  <div
                    className="w-full bg-slate-800 rounded-t-2xl transition-all duration-700 ease-out group-hover:bg-indigo-500"
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-400 font-bold">Sem {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assignment Completion / Donut Chart */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100/60 flex flex-col items-center justify-center relative">
          <div className="absolute top-8 left-8">
            <h3 className="font-bold text-slate-900 text-lg">Assignment Completion</h3>
          </div>
          <button className="absolute top-8 right-8 text-slate-300 hover:text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
          </button>

          <div className="relative w-64 h-64 mt-8">
            {/* CSS Conic Gradient for Donut Chart - 65% completed (dark), rest light */}
            <div
              className="w-full h-full rounded-full transition-transform hover:scale-105 duration-500"
              style={{
                background: 'conic-gradient(#1e293b 0% 65%, #f1f5f9 65% 100%)',
                mask: 'radial-gradient(transparent 55%, black 56%)',
                WebkitMask: 'radial-gradient(transparent 55%, black 56%)'
              }}
            ></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-slate-900">65%</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Total Summary</span>
            </div>
          </div>

          <div className="flex justify-center gap-8 mt-8 w-full px-8">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-100"></span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-100"></span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Overdue</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. ATTENDANCE PAGE
// ==========================================
function AttendancePage() {
  const [attendance, setAttendance] = useState({ subjects: [], overall: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const storedAuth = getAuthData();
        const data = await getAttendanceForStudent(storedAuth.studentId);
        if (!data || !data.subjects) {
          setAttendance({ subjects: [], overall: { attendedClasses: 0, totalClasses: 0, percentage: 0 } });
        } else {
          setAttendance(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Attendance Report</h2>

      {attendance.overall && (
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700">Overall Attendance</h3>
            <span className="text-3xl font-bold text-slate-900">{attendance.overall.percentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
            <div className="bg-slate-900 h-full rounded-full transition-all duration-1000" style={{ width: `${attendance.overall.percentage}%` }}></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attendance?.subjects?.map((sub, i) => (
          <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <h4 className="font-bold text-slate-800 mb-2 truncate">{sub.subject}</h4>
            <div className="flex justify-between items-end mb-4">
              <span className="text-slate-500 text-sm">{sub.attendedClasses}/{sub.totalClasses} Classes</span>
              <span className={`text-xl font-bold ${sub.percentage < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>{sub.percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className={`h-full rounded-full ${sub.percentage < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${sub.percentage}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 3. MARKS PAGE
// ==========================================
function MarksPage() {
  const [marksData, setMarksData] = useState({ semesters: [] });
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const storedAuth = getAuthData();
        const data = await getMarksForStudent(storedAuth.studentId);
        setMarksData(data);
        if (data.semesters && data.semesters.length > 0) {
          setSelectedSemester(data.semesters[0].semester);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const currentSemester = marksData.semesters.find(s => s.semester === selectedSemester);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Academic Results</h2>
        {marksData.semesters.length > 0 && (
          <select
            className="p-3 bg-white border-none rounded-2xl shadow-sm text-slate-700 font-bold focus:ring-2 focus:ring-indigo-100 outline-none"
            value={selectedSemester || ''}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
          >
            {marksData.semesters.map(s => <option key={s.semester} value={s.semester}>Semester {s.semester}</option>)}
          </select>
        )}
      </div>

      {currentSemester && (
        <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Overall Performance</h3>
              <p className="text-slate-500 text-sm">Semester {currentSemester.semester}</p>
            </div>
            <div className="text-right">
              <span className="block text-3xl font-bold text-slate-900">{currentSemester.percentage}%</span>
              <span className="text-sm text-slate-400 font-medium">Weighted Average</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-6 font-semibold">Subject</th>
                  <th className="p-6 font-semibold">Internal</th>
                  <th className="p-6 font-semibold">External</th>
                  <th className="p-6 font-semibold">Total</th>
                  <th className="p-6 font-semibold">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentSemester.subjects.map((sub, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-medium text-slate-900">{sub.subject}</td>
                    <td className="p-6 text-slate-500">{sub.internalMarks}</td>
                    <td className="p-6 text-slate-500">{sub.externalMarks}</td>
                    <td className="p-6 font-bold text-slate-800">{sub.total}</td>
                    <td className="p-6"><span className="px-3 py-1 rounded-lg bg-slate-100 font-bold text-slate-600 text-xs">{sub.grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. FEES PAGE
// ==========================================
function FeesPage() {
  const [feesData, setFeesData] = useState({ fees: [], summary: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentFees().then(setFeesData).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Fees Status</h2>

      {feesData.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Fees</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">₹{feesData.summary.totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Paid Amount</p>
            <p className="text-2xl font-bold text-emerald-600 mt-2">₹{feesData.summary.paidAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Due</p>
            <p className="text-2xl font-bold text-rose-600 mt-2">₹{feesData.summary.pendingAmount.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-900 mb-6">Payment History</h3>
        <div className="space-y-4">
          {feesData.fees.map(fee => (
            <div key={fee.id} className="flex flex-col md:flex-row justify-between items-center p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${fee.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {fee.status === 'Paid' ? '✓' : '!'}
                </div>
                <div>
                  <p className="font-bold text-slate-900">Semester {fee.semester}</p>
                  <p className="text-xs text-slate-500">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <span className="font-bold text-slate-800">₹{fee.amount.toLocaleString()}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${fee.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{fee.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. COURSES PAGE
// ==========================================
function CoursesPage() {
  const [coursesData, setCoursesData] = useState({ courses: [] });

  useEffect(() => {
    getCoursesForStudent().then(setCoursesData).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Enrolled Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesData.courses.map(course => (
          <div key={course._id} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase">{course.courseId}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1">{course.courseName}</h3>
            <p className="text-slate-500 text-sm mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">F</span>
              {course.facultyName}
            </p>
            <p className="text-slate-400 text-sm italic line-clamp-2">{course.description || 'No description provided.'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 6. TIMETABLE PAGE
// ==========================================
function TimetablePage() {
  const [timetable, setTimetable] = useState({ schedule: [] });
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

  useEffect(() => {
    getTimetableForStudent().then(setTimetable).catch(console.error);
  }, []);

  const getClass = (day, time) => {
    return timetable.schedule.find(s => s.day === day)?.classes.find(c => c.time === time);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Weekly Schedule</h2>
        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Live Updates</span>
      </div>

      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-6 gap-4 mb-4">
            <div className="text-center text-xs font-bold text-slate-400 uppercase">Time</div>
            {days.map(d => <div key={d} className="text-center font-bold text-slate-800">{d}</div>)}
          </div>

          {times.map(t => (
            <div key={t} className="grid grid-cols-6 gap-4 mb-4">
              <div className="flex items-center justify-center text-xs font-bold text-slate-500 bg-slate-50 rounded-xl">{t}</div>
              {days.map(d => {
                const c = getClass(d, t);
                return (
                  <div key={d + t} className={`min-h-[100px] p-4 rounded-2xl border transition-all ${c ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50/50 border-slate-50'}`}>
                    {c && (
                      <>
                        <p className="text-xs font-bold text-indigo-400 mb-1">{c.courseId}</p>
                        <p className="font-bold text-indigo-900 text-sm leading-tight">{c.courseName}</p>
                        <p className="text-indigo-400 text-xs mt-2">{c.room || 'TBA'}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. PROFILE PAGE
// ==========================================
function ProfilePage() {
  const [profile, setProfile] = useState({ name: '', studentId: '', email: '', phone: '', department: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const storedAuth = getAuthData();
    getProfileForStudent(storedAuth.studentId).then(setProfile).catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profile.studentId, { name: profile.name, email: profile.email, phone: profile.phone });
      setMsg({ type: 'success', text: 'Profile updated!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex items-center gap-8">
        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-400">
          {profile.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{profile.name}</h2>
          <div className="flex gap-4 mt-2">
            <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold border border-slate-100">{profile.studentId}</span>
            <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold border border-slate-100">{profile.department}</span>
            <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold border border-slate-100">{profile.phone || 'No Phone'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 max-w-2xl">
        <h3 className="font-bold text-slate-900 mb-6">Edit Details</h3>
        {msg.text && <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{msg.text}</div>}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label>
            <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full p-4 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email Address</label>
            <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full p-4 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Phone</label>
            <input type="text" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full p-4 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
          <button type="submit" className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 8. MAIN DASHBOARD WRAPPER
// ==========================================
export default function Dashboard() {
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authData');
    window.location.href = '/login';
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardHome />;
      case 'attendance': return <AttendancePage />;
      case 'marks': return <MarksPage />;
      case 'fees': return <FeesPage />;
      case 'courses': return <CoursesPage />;
      case 'timetable': return <TimetablePage />;
      case 'profile': return <ProfilePage />;
      default: return <DashboardHome />;
    }
  };

  return (
    <DashboardLayout activePage={activePage} onPageChange={setActivePage} onLogout={handleLogout}>
      {renderPage()}
    </DashboardLayout>
  );
}
