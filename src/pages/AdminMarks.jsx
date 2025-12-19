import { useEffect, useState } from 'react';
import {
  getMarksForStudentAndSemester,
  getSemestersForStudent,
  updateMarkRecord,
} from '../services/marksService';

export default function AdminMarks() {
  const [studentUsers, setStudentUsers] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [semesterMarks, setSemesterMarks] = useState([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Simple route protection
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
      window.location.href = '/';
    }
  }, []);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      const { getAllStudents } = await import('../services/studentService');
      const all = await getAllStudents();
      setStudentUsers(all);
    }
    fetchStudents();
  }, []);

  // Initialize student
  useEffect(() => {
    if (!selectedStudentId && studentUsers.length > 0) {
      setSelectedStudentId(studentUsers[0]._id);
    }
  }, [selectedStudentId, studentUsers]);

  // Load semesters when student changes
  useEffect(() => {
    const fetchSemesters = async () => {
      if (!selectedStudentId) {
        setAvailableSemesters([]);
        setSelectedSemester('');
        setSemesterMarks([]);
        return;
      }

      const semesters = await getSemestersForStudent(selectedStudentId);
      setAvailableSemesters(semesters);

      if (semesters.length > 0) {
        setSelectedSemester(String(semesters[0]));
      } else {
        setSelectedSemester('1');
      }
    };
    fetchSemesters();
  }, [selectedStudentId]);

  // Load marks when semester changes
  useEffect(() => {
    const fetchMarks = async () => {
      if (!selectedStudentId || !selectedSemester) {
        setSemesterMarks([]);
        return;
      }
      const records = await getMarksForStudentAndSemester(
        selectedStudentId,
        selectedSemester
      );
      setSemesterMarks(records);
      setMessage('');
    }
    fetchMarks();
  }, [selectedStudentId, selectedSemester]);

  const handleMarksChange = (index, field, value) => {
    const updated = [...semesterMarks];
    const record = { ...updated[index] };

    if (field === 'subject' || field === 'grade') {
      record[field] = value;
    } else {
      const numeric = Number(value);
      record[field] = Number.isNaN(numeric) ? 0 : numeric;
    }

    if (field === 'internalMarks' || field === 'externalMarks') {
      const internal = Number(record.internalMarks) || 0;
      const external = Number(record.externalMarks) || 0;
      record.total = internal + external;
    }

    updated[index] = record;
    setSemesterMarks(updated);
    if (message) setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const promises = semesterMarks.map(async (record, index) => {
        const savedRecord = await updateMarkRecord({
          ...record,
          userId: selectedStudentId,
          semester: Number(selectedSemester)
        });
        return { index, savedRecord };
      });

      const results = await Promise.all(promises);

      setSemesterMarks(prev => {
        const newList = [...prev];
        results.forEach(({ index, savedRecord }) => {
          if (savedRecord && savedRecord._id) {
            newList[index] = { ...newList[index], _id: savedRecord._id };
          }
        });
        return newList;
      });

      setMessage('Marks saved successfully!');
    } catch (e) {
      console.error(e);
      setMessage('Error saving marks.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-['Poppins']">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marks Management</h1>
          <p className="text-slate-500 text-sm font-medium">
            Adjust student marks and grades.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex flex-col gap-1">
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

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Semester</label>
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm appearance-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <option key={i} value={i}>Semester {i}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
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
        {semesterMarks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <p className="text-slate-500 font-medium mb-4">No marks records found for this student and semester.</p>
            <button
              onClick={() => setSemesterMarks([{ subject: 'New Subject', internalMarks: 0, externalMarks: 0, total: 0, grade: 'F' }])}
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
                      Internal
                    </th>
                    <th className="px-6 py-4 text-center font-bold text-slate-400 uppercase tracking-wider text-xs">
                      External
                    </th>
                    <th className="px-6 py-4 text-center font-bold text-slate-400 uppercase tracking-wider text-xs">
                      Total
                    </th>
                    <th className="px-6 py-4 text-center font-bold text-slate-400 uppercase tracking-wider text-xs">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {semesterMarks.map((record, index) => (
                    <tr
                      key={`${selectedStudentId}-${selectedSemester}-${index}`}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                          value={record.subject}
                          onChange={(e) =>
                            handleMarksChange(index, 'subject', e.target.value)
                          }
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          min="0"
                          className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-lg text-center text-slate-900 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                          value={record.internalMarks}
                          onChange={(e) =>
                            handleMarksChange(
                              index,
                              'internalMarks',
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
                          value={record.externalMarks}
                          onChange={(e) =>
                            handleMarksChange(
                              index,
                              'externalMarks',
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold">
                          {record.total}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="text"
                          className="w-16 px-3 py-2 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-900 uppercase focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                          value={record.grade}
                          onChange={(e) =>
                            handleMarksChange(index, 'grade', e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
              <button
                onClick={() => setSemesterMarks([...semesterMarks, { subject: 'New Subject', internalMarks: 0, externalMarks: 0, total: 0, grade: 'F' }])}
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


