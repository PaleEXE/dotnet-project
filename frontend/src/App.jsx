import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import TaskDetail from './pages/TaskDetail';
import PostTask from './pages/PostTask';
import MyApplications from './pages/MyApplications';
import MyTasks from './pages/MyTasks';
import Profile from './pages/Profile';

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
      <Routes>
        <Route path="/login" element={<Login onLogin={login} />} />
        <Route path="/register" element={<Register onLogin={login} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/">Home</Link>
        {user.role === 'student' && <Link to="/my-applications">My Applications</Link>}
        {user.role === 'student' && <Link to="/profile">Profile</Link>}
        {user.role === 'organization' && <Link to="/my-tasks">My Tasks</Link>}
        {user.role === 'organization' && <Link to="/tasks/new">Post Task</Link>}
        <div className="spacer" />
        <span style={{ color: '#fff', fontSize: 14 }}>{user.email}</span>
        <button onClick={logout}>Logout</button>
      </nav>
      <Routes>
        <Route path="/" element={<Home user={user} token={token} />} />
        <Route path="/tasks/new" element={<PostTask user={user} token={token} />} />
        <Route path="/tasks/:id" element={<TaskDetail user={user} token={token} />} />
        <Route path="/my-applications" element={<MyApplications user={user} token={token} />} />
        <Route path="/my-tasks" element={<MyTasks user={user} token={token} />} />
        <Route path="/profile" element={<Profile user={user} token={token} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export { API };
export default App;
