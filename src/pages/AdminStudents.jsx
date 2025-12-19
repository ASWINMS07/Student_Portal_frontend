import { useEffect, useState } from 'react';
import { getAllStudents, deleteStudent } from '../services/studentService';
import AdminEditStudent from './AdminEditStudent';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [editingStudentId, setEditingStudentId] = useState(null);

  // Simple route protection: only allow logged-in admins
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      const all = await getAllStudents();
      setStudents(all);
    };
    fetchStudents();
  }, []);

  const handleEditClick = (studentId) => {
    setEditingStudentId(studentId);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      const success = await deleteStudent(id);
      if (success) {
        setStudents(prev => prev.filter(s => s._id !== id));
      } else {
        alert('Failed to delete student');
      }
    }
  };

  const handleStudentSaved = async () => {
    const all = await getAllStudents();
    setStudents(all);
    setEditingStudentId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in font-['Poppins']">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-500 text-sm font-medium">
            View and manage all registered students.
          </p>
        </div>

      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Student ID</th>
                <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Name</th>
                <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Email</th>
                <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Department</th>
                <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Phone</th>
                <th className="px-6 py-4 text-right font-bold text-slate-400 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-400 font-medium"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-slate-900 font-bold font-mono text-xs sm:text-sm">
                      <span className="bg-slate-100 px-2 py-1 rounded-lg text-slate-600 border border-slate-200">{student.studentId}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-bold">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {student.department || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {student.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(student._id)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(student._id)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingStudentId && (
        <AdminEditStudent
          studentId={editingStudentId}
          onClose={() => setEditingStudentId(null)}
          onSaved={handleStudentSaved}
        />
      )}
    </div>
  );
}


