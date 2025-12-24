import { useState } from 'react';
import { loginUser } from '../services/userService';

export default function Login({ onLoginSuccess, onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    studentId: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (formData.role === 'student') {
      if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
    } else {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
    }
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setMessage('');

    if (!validate()) return;

    setLoading(true);
    try {
      const selectedRole = formData.role;
      const password = formData.password.trim();
      const email = formData.email.trim();
      const studentId = formData.studentId.trim();

      const response = await loginUser({
        email,
        studentId: selectedRole === 'student' ? studentId : null,
        password,
        role: selectedRole,
      });

      const user = response.user;
      const token = response.token;

      const authData = {
        role: user.role,
        email: user.email,
      };

      if (user.role === 'student' && user.studentId) {
        authData.studentId = user.studentId;
      }
      if (user.name) {
        authData.name = user.name;
      }

      localStorage.setItem('authData', JSON.stringify(authData));
      localStorage.setItem('role', user.role);
      localStorage.setItem('token', token);

      onLoginSuccess?.();

    } catch (err) {
      setMessage(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center p-4 relative font-['Poppins']">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-slate-200 border border-slate-100">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Sri Eshwar College
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Student Information Portal
            </p>
          </div>

          {/* Error Message */}
          {message && (
            <div className="mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-100 text-red-600 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Role Toggle */}
            <div className="bg-slate-50 p-1.5 rounded-xl flex border border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, role: 'student' }));
                  setErrors(prev => ({ ...prev, studentId: '', email: '' }));
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${formData.role === 'student'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, role: 'admin' }));
                  setErrors(prev => ({ ...prev, studentId: '', email: '' }));
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${formData.role === 'admin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                Admin
              </button>
            </div>

            <div className="space-y-4">
              {/* Student ID Field - Only for Students */}
              {formData.role === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Student ID</label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="S1001"
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${errors.studentId ? 'border-red-500 bg-red-50' : 'border-slate-100'}`}
                  />
                  {errors.studentId && <p className="text-xs text-red-500 ml-1 mt-1 font-medium">{errors.studentId}</p>}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-slate-100'}`}
                />
                {errors.email && <p className="text-xs text-red-500 ml-1 mt-1 font-medium">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                  <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot Pwd?</a>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${errors.password ? 'border-red-500 bg-red-50' : 'border-slate-100'}`}
                />
                {errors.password && <p className="text-xs text-red-500 ml-1 mt-1 font-medium">{errors.password}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-slate-900/20 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer - Only for Students */}
          {formData.role === 'student' && (
            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm font-medium">
                New student?{' '}
                <button
                  onClick={onSwitchToSignup}
                  className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
                >
                  Create an account
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
