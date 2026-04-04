import { useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import TaskDetail from './pages/TaskDetail';
import PostTask from './pages/PostTask';
import MyApplications from './pages/MyApplications';
import MyTasks from './pages/MyTasks';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

const API = 'http://localhost:5001';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  const login = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwt);
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Routes>
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/register" element={<Register onLogin={login} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    );
  }

  const isStudent = user.role === 'student' || user.role === 'admin';
  const isOrg = user.role === 'organization';
  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Navbar */}
      <nav className="bg-emerald-700 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-white font-bold text-xl tracking-tight">Fursa</Link>
              <div className="hidden md:flex space-x-2">
                <Link to="/" className="text-emerald-50 hover:bg-emerald-800 px-3 py-2 rounded-md font-medium transition-colors">Home</Link>
                {isStudent && <Link to="/my-applications" className="text-emerald-50 hover:bg-emerald-800 px-3 py-2 rounded-md font-medium transition-colors">My Volunteering</Link>}
                {isStudent && <Link to="/profile" className="text-emerald-50 hover:bg-emerald-800 px-3 py-2 rounded-md font-medium transition-colors">Profile</Link>}
                {isOrg && <Link to="/my-tasks" className="text-emerald-50 hover:bg-emerald-800 px-3 py-2 rounded-md font-medium transition-colors">My Tasks</Link>}
                {isOrg && <Link to="/tasks/new" className="text-emerald-50 hover:bg-emerald-800 px-3 py-2 rounded-md font-medium transition-colors">Post Task</Link>}
                {isAdmin && <Link to="/admin" className="text-emerald-50 hover:bg-emerald-800 px-3 py-2 rounded-md font-medium transition-colors">Admin Panel</Link>}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user.profilePictureUrl || user.logoUrl ? (
                <img src={user.profilePictureUrl || user.logoUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-emerald-400 object-cover" title={user.email} />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-50 flex items-center justify-center font-bold border border-emerald-400 text-sm" title={user.email}>
                  {(user.fullName || user.name || user.email || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <button 
                onClick={logout}
                className="bg-transparent border border-emerald-400 text-white hover:bg-emerald-800 hover:border-transparent px-4 py-1.5 rounded text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-emerald-700 focus:ring-white">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Routes>
          <Route path="/" element={<Home user={user} token={token} />} />
          {isOrg && <Route path="/tasks/new" element={<PostTask user={user} token={token} />} />}
          <Route path="/tasks/:id" element={<TaskDetail user={user} token={token} />} />
          {isStudent && <Route path="/my-applications" element={<MyApplications user={user} token={token} />} />}
          {isOrg && <Route path="/my-tasks" element={<MyTasks user={user} token={token} />} />}
          {isStudent && <Route path="/profile" element={<Profile user={user} setUser={setUser} token={token} />} />}
          {isAdmin && <Route path="/admin" element={<AdminPanel user={user} token={token} />} />}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export { API };
export default App;
