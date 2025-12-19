import { useEffect, useState } from 'react';
import { getAttendanceRecordsForStudent, updateAttendanceRecord } from '../services/attendanceService';

export default function AdminAttendance() {
  const [studentUsers, setStudentUsers] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentAttendance, setStudentAttendance] = useState([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      const { getAllStudents } = await import('../services/studentService');
      const all = await getAllStudents();
      setStudentUsers(all);
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!selectedStudentId && studentUsers.length > 0) {
      setSelectedStudentId(studentUsers[0]._id);
    }
  }, [selectedStudentId, studentUsers]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedStudentId) {
        setStudentAttendance([]);
        return;
      }
      const records = await getAttendanceRecordsForStudent(selectedStudentId);
      setStudentAttendance(records);
      setMessage('');
    };
    fetchAttendance();
  }, [selectedStudentId]);

  const handleAttendanceChange = (index, field, value) => {
    const updatedList = [...studentAttendance];
    const record = { ...updatedList[index] };

    const numericValue =
      field === 'subject' ? value : Number.isNaN(Number(value)) ? 0 : Number(value);
    record[field] = numericValue;

    if (field === 'attendedClasses' || field === 'totalClasses') {
      const attended = Number(record.attendedClasses) || 0;
      const total = Number(record.totalClasses) || 0;
      record.percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
    }

    updatedList[index] = record;
    setStudentAttendance(updatedList);
    if (message) setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const promises = studentAttendance.map(async (record, index) => {
        const savedRecord = await updateAttendanceRecord({
          ...record,
          userId: selectedStudentId
        });
        return { index, savedRecord };
      });

      const results = await Promise.all(promises);

      setStudentAttendance(prev => {
        const newList = [...prev];
        results.forEach(({ index, savedRecord }) => {
          if (savedRecord && savedRecord._id) {
            newList[index] = { ...newList[index], _id: savedRecord._id };
          }
        });
        return newList;
      });

      setMessage('Attendance saved successfully!');
    } catch (e) {
      console.error(e);
      setMessage('Error saving attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-['Poppins']">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>
          <p className="text-slate-500 text-sm font-medium">
            Edit attendance records for students.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Student</label>
          <div className="relative">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm appearance-none"
            >
              {studentUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.studentId} - {user.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-xl text-sm border font-medium ${message.includes('Error')
            ? 'bg-red-50 border-red-100 text-red-600'
            : 'bg-emerald-50 border-emerald-100 text-emerald-600'
          }`}>
          {message}
        </div>
      )}

      <section className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
        {studentAttendance.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-slate-500 font-medium mb-4">No attendance records found for this student.</p>
            <button
              onClick={() => setStudentAttendance([{ subject: 'New Subject', attendedClasses: 0, totalClasses: 0, percentage: 0 }])}
              className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5"
            >
              Add First Subject
            </button>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-center font-bold text-slate-400 uppercase tracking-wider text-xs">
                      Attended
                    </th>
                    <th className="px-6 py-4 text-center font-bold text-slate-400 uppercase tracking-wider text-xs">
                      Total
                    </th>
                    <th className="px-6 py-4 text-center font-bold text-slate-400 uppercase tracking-wider text-xs">
                      Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentAttendance.map((record, index) => (
                    <tr
                      key={`${selectedStudentId}-${index}`}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                          value={record.subject}
                          onChange={(e) => handleAttendanceChange(index, 'subject', e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          min="0"
                          className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-lg text-center text-slate-900 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                          value={record.attendedClasses}
                          onChange={(e) =>
                            handleAttendanceChange(
                              index,
                              'attendedClasses',
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          min="0"
                          className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-lg text-center text-slate-900 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                          value={record.totalClasses}
                          onChange={(e) =>
                            handleAttendanceChange(
                              index,
                              'totalClasses',
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${record.percentage >= 75 ? 'bg-emerald-50 text-emerald-600' :
                            record.percentage >= 60 ? 'bg-amber-50 text-amber-600' :
                              'bg-rose-50 text-rose-600'
                          }`}>
                          {record.percentage}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
              <button
                onClick={() => setStudentAttendance([...studentAttendance, { subject: 'New Subject', attendedClasses: 0, totalClasses: 0, percentage: 0 }])}
                className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                + Add Subject
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all transform hover:-translate-y-0.5"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}


