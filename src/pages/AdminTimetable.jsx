import { useEffect, useState } from 'react';
import { getTimetableForStudent, updateTimetable, deleteTimetableEntry } from '../services/timetableService';
import { getCoursesForStudent } from '../services/coursesService';
import { getAllStudents } from '../services/studentService';

export default function AdminTimetable() {
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [timetable, setTimetable] = useState([]);
    const [courses, setCourses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [editingEntry, setEditingEntry] = useState(null);
    const [formData, setFormData] = useState({
        day: 'Monday',
        time: '09:00',
        courseId: '',
        room: ''
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    useEffect(() => {
        const init = async () => {
            try {
                const [studs, crs] = await Promise.all([
                    getAllStudents(),
                    getCoursesForStudent()
                ]);
                setStudents(studs);
                setCourses(crs.courses);
                if (studs.length > 0) setSelectedStudentId(studs[0]._id);
            } catch (err) {
                setError('Failed to load initial data');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (selectedStudentId) fetchTimetable(selectedStudentId);
    }, [selectedStudentId]);

    const fetchTimetable = async (userId) => {
        try {
            const data = await getTimetableForStudent(userId);
            // Flatten the grouped schedule for the table view
            const flat = [];
            data.schedule.forEach(dayGroup => {
                dayGroup.classes.forEach(cls => {
                    flat.push({ ...cls, day: dayGroup.day });
                });
            });
            setTimetable(flat);
        } catch (err) {
            setError('Failed to load timetable');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            if (!formData.courseId) throw new Error('Please select a course');

            const selectedCourse = courses.find(c => c.courseId === formData.courseId);
            if (!selectedCourse) throw new Error('Invalid course selected');

            await updateTimetable({
                _id: editingEntry?._id,
                userId: selectedStudentId,
                day: formData.day,
                time: formData.time,
                courseId: selectedCourse.courseId,
                courseName: selectedCourse.courseName,
                facultyName: selectedCourse.facultyName,
                room: formData.room
            });

            setMessage('Timetable entry saved!');
            setFormData({ day: 'Monday', time: '09:00', courseId: '', room: '' });
            setEditingEntry(null);
            fetchTimetable(selectedStudentId);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (entry) => {
        setEditingEntry(entry);
        setFormData({
            day: entry.day,
            time: entry.time,
            courseId: entry.courseId,
            room: entry.room || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this entry?')) return;
        try {
            await deleteTimetableEntry(id);
            setMessage('Entry deleted');
            fetchTimetable(selectedStudentId);
        } catch (err) {
            setError('Delete failed');
        }
    };

    if (loading) return <div className="p-12 text-center font-['Poppins']"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div></div>;

    return (
        <div className="space-y-6 animate-fade-in font-['Poppins']">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Timetable Management</h1>
                    <p className="text-slate-500 text-sm font-medium">Assign weekly schedules to students.</p>
                </div>
                <div className="flex flex-col items-start gap-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Student</label>
                    <div className="relative">
                        <select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm appearance-none"
                        >
                            {students.map(s => (
                                <option key={s._id} value={s._id}>{s.studentId} - {s.name}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>
            </header>

            {/* Entry Form */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        {editingEntry ? 'Edit Class Slot' : 'Add New Class Slot'}
                    </h2>
                    {editingEntry && (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-lg border border-amber-100">Editing Mode</span>
                    )}
                </div>

                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Day</label>
                        <select
                            name="day"
                            value={formData.day}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                        >
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Time</label>
                        <input
                            name="time"
                            type="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Course</label>
                        <select
                            name="courseId"
                            value={formData.courseId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                        >
                            <option value="">Select Course</option>
                            {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.courseId} - {c.courseName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Room (Optional)</label>
                        <input
                            name="room"
                            type="text"
                            value={formData.room}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                            placeholder="e.g. Lab 1"
                        />
                    </div>

                    <div className="md:col-span-4 flex justify-end gap-3 mt-4">
                        {editingEntry && (
                            <button
                                type="button"
                                onClick={() => { setEditingEntry(null); setFormData({ day: 'Monday', time: '09:00', courseId: '', room: '' }); }}
                                className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all transform hover:-translate-y-0.5"
                        >
                            {editingEntry ? 'Update Slot' : 'Add Slot'}
                        </button>
                    </div>
                </form>

                {message && (
                    <div className="mt-6 p-4 rounded-xl text-sm bg-emerald-50 border border-emerald-100 text-emerald-600 font-medium animate-fade-in">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mt-6 p-4 rounded-xl text-sm bg-red-50 border border-red-100 text-red-600 font-medium animate-fade-in">
                        {error}
                    </div>
                )}
            </div>

            {/* Schedule for Selected Student */}
            <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Day</th>
                                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Time</th>
                                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Course</th>
                                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Faculty</th>
                                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Room</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-400 uppercase tracking-wider text-xs">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {days.map(day => {
                                const dayClasses = timetable.filter(t => t.day === day).sort((a, b) => a.time.localeCompare(b.time));
                                if (dayClasses.length === 0) return null;
                                return dayClasses.map((entry, idx) => (
                                    <tr key={entry._id} className="hover:bg-slate-50 transition-colors">
                                        {idx === 0 && (
                                            <td className="px-6 py-4 font-bold text-slate-900 border-r border-slate-100 bg-slate-50/50" rowSpan={dayClasses.length}>
                                                {day}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 font-mono font-bold text-indigo-600">{entry.time}</td>
                                        <td className="px-6 py-4">
                                            <span className="block font-bold text-slate-900">{entry.courseId}</span>
                                            <p className="text-xs text-slate-500 font-medium">{entry.courseName}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs font-medium">{entry.facultyName}</td>
                                        <td className="px-6 py-4 text-slate-700 font-medium">{entry.room || '-'}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(entry)}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(entry._id)}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                                            >
                                                Del
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            })}
                            {timetable.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">
                                        No timetable entries found for this student.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
