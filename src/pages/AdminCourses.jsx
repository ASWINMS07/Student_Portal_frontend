import { useEffect, useState } from 'react';
import { getCoursesForStudent, updateCourse, deleteCourse } from '../services/coursesService';

export default function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        courseId: '',
        courseName: '',
        facultyName: '',
        description: ''
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await getCoursesForStudent();
            setCourses(data.courses);
        } catch (err) {
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            if (!formData.courseId || !formData.courseName || !formData.facultyName) {
                throw new Error('Please fill all required fields');
            }

            await updateCourse({
                ...formData,
                _id: editingCourse?._id
            });

            setMessage(editingCourse ? 'Course updated successfully!' : 'Course added successfully!');
            setFormData({ courseId: '', courseName: '', facultyName: '', description: '' });
            setEditingCourse(null);
            fetchCourses();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData({
            courseId: course.courseId,
            courseName: course.courseName,
            facultyName: course.facultyName,
            description: course.description || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            await deleteCourse(id);
            setMessage('Course deleted successfully');
            fetchCourses();
        } catch (err) {
            setError('Failed to delete course');
        }
    };

    if (loading) return <div className="p-12 text-center font-['Poppins']"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div></div>;

    return (
        <div className="space-y-6 animate-fade-in font-['Poppins']">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Course Management</h1>
                <p className="text-slate-500 text-sm font-medium">Add or edit courses in the global catalog.</p>
            </div>

            {/* Form */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        {editingCourse ? 'Edit Course' : 'Add New Course'}
                    </h2>
                    {editingCourse && (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-lg border border-amber-100">Editing Mode</span>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Course ID</label>
                        <input
                            type="text"
                            name="courseId"
                            value={formData.courseId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                            placeholder="e.g. CS101"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Course Name</label>
                        <input
                            type="text"
                            name="courseName"
                            value={formData.courseName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                            placeholder="e.g. Intro to Computing"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Faculty Name</label>
                        <input
                            type="text"
                            name="facultyName"
                            value={formData.facultyName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                            placeholder="e.g. Dr. Smith"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Description</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                            placeholder="Course overview..."
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                        {editingCourse && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingCourse(null);
                                    setFormData({ courseId: '', courseName: '', facultyName: '', description: '' });
                                }}
                                className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all transform hover:-translate-y-0.5"
                        >
                            {editingCourse ? 'Save Changes' : 'Add Course'}
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

            {/* List */}
            <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Course ID</th>
                                <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Course Name</th>
                                <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Faculty</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-400 uppercase tracking-wider text-xs">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {courses.map(course => (
                                <tr key={course._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        <span className="bg-slate-100 px-2 py-1 rounded-lg text-slate-600 border border-slate-200 font-mono text-xs">{course.courseId}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700 font-medium">{course.courseName}</td>
                                    <td className="px-6 py-4 text-slate-500">{course.facultyName}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(course)}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course._id)}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {courses.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">
                                        No courses found. Add your first course above.
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
