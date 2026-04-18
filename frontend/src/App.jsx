import { useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { useI18n } from './i18n/I18nContext';
import ProfileAvatar from './components/ProfileAvatar';
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
import Organizations from './pages/Organizations';
import OrganizationProfile from './pages/OrganizationProfile';

const API = 'http://localhost:5001';

function App() {
  const { t, lang, setLang, dir } = useI18n();

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

  // ── Language Switcher Component ────────────────────────────
  const LangSwitcher = () => (
    <div className="lang-switcher">
      <button
        onClick={() => setLang('en')}
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('ar')}
        className={`lang-btn ${lang === 'ar' ? 'active' : ''}`}
      >
        عر
      </button>
    </div>
  );

  if (!user) {
    return (
      <div dir={dir} className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        {/* Floating language switcher on auth pages */}
        <div className="fixed top-4 right-4 z-50">
          <div className="lang-switcher" style={{ background: 'rgba(15, 23, 42, 0.08)', border: '1px solid rgba(15, 23, 42, 0.12)' }}>
            <button
              onClick={() => setLang('en')}
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              style={{ color: lang === 'en' ? '#065f46' : '#475569' }}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ar')}
              className={`lang-btn ${lang === 'ar' ? 'active' : ''}`}
              style={{ color: lang === 'ar' ? '#065f46' : '#475569' }}
            >
              عر
            </button>
          </div>
        </div>

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
    <div dir={dir} className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Navbar */}
      <nav className="bg-emerald-700 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-white font-bold text-xl tracking-tight">{t('nav.appName')}</Link>
              <div className="hidden md:flex space-x-2">
                <Link to="/" className="text-emerald-50 hover:bg-emerald-800 px-3 py-2 rounded-md font-medium transition-colors">{t('nav.home')}</Link>
                <Link to="/organizations" className="text-emerald-50 hover:bg-emerald-800 px-3 py-2 rounded-md font-medium transition-colors">{t('nav.organizations')}</Link>
                {isStudent && <Link to="/my-applications" className="text-emerald-50 hover:bg-emerald-800 px-3 py-2 rounded-md font-medium transition-colors">{t('nav.myVolunteering')}</Link>}
                {isStudent && <Link to="/profile" className="text-emerald-50 hover:bg-emerald-800 px-3 py-2 rounded-md font-medium transition-colors">{t('nav.profile')}</Link>}
                {isOrg && <Link to="/my-tasks" className="text-emerald-50 hover:bg-emerald-800 px-3 py-2 rounded-md font-medium transition-colors">{t('nav.myTasks')}</Link>}
                {isOrg && <Link to="/tasks/new" className="text-emerald-50 hover:bg-emerald-800 px-3 py-2 rounded-md font-medium transition-colors">{t('nav.postTask')}</Link>}
                {isAdmin && <Link to="/admin" className="text-emerald-50 hover:bg-emerald-800 px-3 py-2 rounded-md font-medium transition-colors">{t('nav.adminPanel')}</Link>}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <LangSwitcher />

              <ProfileAvatar
                src={user.profilePictureUrl || user.logoUrl}
                name={user.fullName || user.name || user.email}
                size="sm"
                borderColor="border-emerald-400"
                clickable={!!(user.profilePictureUrl || user.logoUrl)}
              />

              <button 
                onClick={logout}
                className="bg-transparent border border-emerald-400 text-white hover:bg-emerald-800 hover:border-transparent px-4 py-1.5 rounded text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-emerald-700 focus:ring-white">
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Routes>
          <Route path="/" element={<Home user={user} token={token} />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/organizations/:id" element={<OrganizationProfile user={user} token={token} />} />
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
