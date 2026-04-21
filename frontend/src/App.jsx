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
          <div className="lang-switcher" style={{ background: 'var(--color-offwhite)', border: '1px solid var(--color-sand)' }}>
            <button
              onClick={() => setLang('en')}
              className={`lang-btn ${lang === 'en' ? 'active font-bold' : ''}`}
              style={{ color: lang === 'en' ? 'var(--color-earth)' : 'var(--color-ink)' }}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ar')}
              className={`lang-btn ${lang === 'ar' ? 'active font-bold' : ''}`}
              style={{ color: lang === 'ar' ? 'var(--color-earth)' : 'var(--color-ink)' }}
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
    <div dir={dir} className="min-h-screen bg-offwhite text-ink font-sans pb-20">
      {/* Top Header for Auth & Lang Switcher */}
      <header className="bg-sand/20 shadow-sm sticky top-0 z-40 px-4 py-3 border-b border-sand">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-earth hover:text-earth/80 font-bold text-xl tracking-tight transition-colors">{t('nav.appName')}</Link>
          <div className="flex items-center gap-3">
            <LangSwitcher />
            <ProfileAvatar
              src={user.profilePictureUrl || user.logoUrl}
              name={user.fullName || user.name || user.email}
              size="sm"
              borderColor="border-earth"
              clickable={!!(user.profilePictureUrl || user.logoUrl)}
            />
            <button 
              onClick={logout}
              className="text-earth hover:text-sand-hover text-sm font-semibold transition-all">
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-offwhite border-t border-earth/20 shadow-[0_-2px_10px_rgba(140,120,89,0.1)] z-50">
        <div className="max-w-md mx-auto flex justify-between items-center px-6 py-3">
          <Link to="/" className="flex flex-col items-center text-earth hover:text-sand-hover focus:text-sand-hover transition-colors delay-50">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span className="text-xs font-semibold">{t('nav.home')}</span>
          </Link>
          <Link to="/organizations" className="flex flex-col items-center text-earth hover:text-sand-hover focus:text-sand-hover transition-colors delay-50">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            <span className="text-xs font-semibold">{t('nav.organizations')}</span>
          </Link>
          {isStudent && (
            <Link to="/my-applications" className="flex flex-col items-center text-earth hover:text-sand-hover focus:text-sand-hover transition-colors delay-50">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514"></path></svg>
              <span className="text-xs font-semibold">{t('nav.myVolunteering')}</span>
            </Link>
          )}
          {isOrg && (
            <Link to="/my-tasks" className="flex flex-col items-center text-earth hover:text-sand-hover focus:text-sand-hover transition-colors delay-50">
               <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              <span className="text-xs font-semibold">{t('nav.myTasks')}</span>
            </Link>
          )}
          {isStudent && (
            <Link to="/profile" className="flex flex-col items-center text-earth hover:text-sand-hover focus:text-sand-hover transition-colors delay-50">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              <span className="text-xs font-semibold">{t('nav.profile')}</span>
            </Link>
          )}
           {isOrg && (
            <Link to="/tasks/new" className="flex flex-col items-center text-earth hover:text-sand-hover focus:text-sand-hover transition-colors delay-50">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              <span className="text-xs font-semibold">{t('nav.postTask')}</span>
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="flex flex-col items-center text-earth hover:text-sand-hover focus:text-sand-hover transition-colors delay-50">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span className="text-xs font-semibold">Admin</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

export { API };
export default App;
