import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const authData = localStorage.getItem('authData');

    if (token && role && authData) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <Login onLoginSuccess={handleLoginSuccess} onSwitchToSignup={() => navigate('/signup')} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/signup"
        element={!isAuthenticated ? <Signup onSwitchToLogin={() => navigate('/login')} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            localStorage.getItem('role') === 'admin' ?
              <AdminDashboard onLogout={handleLogout} /> :
              <Dashboard onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
