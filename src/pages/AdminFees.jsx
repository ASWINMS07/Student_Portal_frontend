import { useEffect, useState } from 'react';
import { getFeesRecordsForStudent, updateFeeRecord } from '../services/feesService';

export default function AdminFees() {
  const [studentUsers, setStudentUsers] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [records, setRecords] = useState([]);
  const [adding, setAdding] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    if (!selectedStudentId && studentUsers.length > 0) {
      setSelectedStudentId(studentUsers[0]._id);
    }
  }, [selectedStudentId, studentUsers]);

  useEffect(() => {
    const fetchFees = async () => {
      if (!selectedStudentId) {
        setRecords([]);
        return;
      }
      const recs = await getFeesRecordsForStudent(selectedStudentId);
      setRecords(recs);
      setMessage('');
    };
    fetchFees();
  }, [selectedStudentId]);

  const handleChange = (index, field, value) => {
    const updated = [...records];
    const rec = { ...updated[index] };

    if (field === 'amount') rec.amount = Number(value) || 0;
    else rec[field] = value;

    updated[index] = rec;
    setRecords(updated);
    if (message) setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const promises = records.map(async (rec, index) => {
        const savedRecord = await updateFeeRecord({ ...rec, userId: selectedStudentId });
        return { index, savedRecord };
      });

      const results = await Promise.all(promises);

      setRecords(prev => {
        const newList = [...prev];
        results.forEach(({ index, savedRecord }) => {
          if (savedRecord && savedRecord._id) {
            newList[index] = { ...newList[index], _id: savedRecord._id };
          }
        });
        return newList;
      });

      setMessage('Fees saved successfully!');
    } catch (e) {
      console.error(e);
      setMessage('Error saving fees.');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    setAdding(true);
    const newRec = {
      userId: selectedStudentId,
      semester: 1,
      amount: 0,
      status: 'Pending',
      dueDate: new Date().toISOString().split('T')[0],
      paidDate: null,
    };

    setRecords([...records, newRec]);
    setAdding(false);
  };

  return (
    <div className="space-y-6 animate-fade-in font-['Poppins']">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fees Management</h1>
          <p className="text-slate-500 text-sm font-medium">Edit fees records for students.</p>
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Student</label>
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm appearance-none"
              >
                {studentUsers.map((u) => (
                  <option key={u._id} value={u._id}>{u.studentId} - {u.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!selectedStudentId}
            className="px-4 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Fee
          </button>
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
        {records.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <p className="text-slate-500 font-medium mb-4">No fee records found for this student.</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Semester</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Amount</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Due Date</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Paid Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((rec, idx) => (
                    <tr key={`${selectedStudentId}-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <input type="number" min="1" className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all" value={rec.semester} onChange={(e) => handleChange(idx, 'semester', Number(e.target.value) || 1)} />
                      </td>
                      <td className="px-6 py-4">
                        <input type="number" className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all" value={rec.amount} onChange={(e) => handleChange(idx, 'amount', e.target.value)} />
                      </td>
                      <td className="px-6 py-4">
                        <select value={rec.status} onChange={(e) => handleChange(idx, 'status', e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all">
                          <option>Paid</option>
                          <option>Pending</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input type="date" value={rec.dueDate ? String(rec.dueDate).split('T')[0] : ''} onChange={(e) => handleChange(idx, 'dueDate', e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all" />
                      </td>
                      <td className="px-6 py-4">
                        <input type="date" value={rec.paidDate ? String(rec.paidDate).split('T')[0] : ''} onChange={(e) => handleChange(idx, 'paidDate', e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50/50">
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
