import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../App';
import { useI18n } from '../i18n/I18nContext';

export default function Register({ onLogin }) {
  const { t } = useI18n();
  const [role, setRole] = useState('student');
  
  // User fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [takingVolunteeringCourse, setTakingVolunteeringCourse] = useState(false);
  
  // Org fields
  const [orgName, setOrgName] = useState('');
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let endpoint = `${API}/auth/register`;
    let body = {};

    if (role === 'organization') {
      endpoint = `${API}/auth/register/org`;
      body = { email, password, name: orgName, phoneNumber };
    } else {
      body = { email, password, fullName, phoneNumber, role, universityId, takingVolunteeringCourse };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || t('register.failed'));
      return;
    }

    // Auto-login after registration
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginRes.json();
    if (loginRes.ok) {
      onLogin(loginData.user, loginData.token);
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-slate-100 p-8 my-8 animate-scale-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-ink mb-2">{t('register.title')}</h1>
        <p className="text-earth text-sm">{t('register.subtitle')}</p>
      </div>

      {error && (
         <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md error-banner">
           <p className="text-sm text-red-700 font-medium">{error}</p>
         </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Role Selector toggles */}
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-semibold rounded-2xl transition-all ${role === 'student' ? 'bg-white shadow-sm text-sage-700' : 'text-earth hover:text-ink'}`}
            onClick={() => setRole('student')}
          >
            {t('register.studentTab')}
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-semibold rounded-2xl transition-all ${role === 'organization' ? 'bg-white shadow-sm text-sage-700' : 'text-earth hover:text-ink'}`}
            onClick={() => setRole('organization')}
          >
            {t('register.orgTab')}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-ink mb-1.5">{t('register.email')}</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="w-full px-4 py-2.5 rounded-2xl border border-sand focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none transition-all text-ink"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-ink mb-1.5">{t('register.password')}</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="w-full px-4 py-2.5 rounded-2xl border border-sand focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none transition-all text-ink"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-ink mb-1.5">{t('register.phone')}</label>
            <input 
              type="text" 
              value={phoneNumber} 
              onChange={e => setPhoneNumber(e.target.value)} 
              className="w-full px-4 py-2.5 rounded-2xl border border-sand focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none transition-all text-ink"
            />
          </div>

          {role === 'student' && (
            <>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-ink mb-1.5">{t('register.fullName')}</label>
                <input 
                  type="text"
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  required 
                  className="w-full px-4 py-2.5 rounded-2xl border border-sand focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none transition-all text-ink"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">{t('register.universityId')}</label>
                <input 
                  type="text"
                  value={universityId} 
                  onChange={e => setUniversityId(e.target.value)} 
                  className="w-full px-4 py-2.5 rounded-2xl border border-sand focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none transition-all text-ink"
                />
              </div>

              <div className="flex items-center pt-8">
                <input 
                  type="checkbox" 
                  id="vc" 
                  checked={takingVolunteeringCourse} 
                  onChange={e => setTakingVolunteeringCourse(e.target.checked)} 
                  className="w-5 h-5 text-sage-600 border-sand rounded focus:ring-sage-500 cursor-pointer"
                />
                <label htmlFor="vc" className="ml-2 block text-sm font-medium text-ink cursor-pointer">
                  {t('register.takingCourse')}
                </label>
              </div>
            </>
          )}

          {role === 'organization' && (
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-ink mb-1.5">{t('register.orgName')}</label>
              <input 
                type="text"
                value={orgName} 
                onChange={e => setOrgName(e.target.value)} 
                required 
                className="w-full px-4 py-2.5 rounded-2xl border border-sand focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none transition-all text-ink"
              />
            </div>
          )}

        </div>

        <button 
          type="submit" 
          className="w-full py-3 px-4 mt-4 bg-sage hover:bg-sage-hover text-white font-semibold rounded-2xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500"
        >
          {t('register.submit')}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-slate-100 pt-6">
        <p className="text-sm text-earth">
          {t('register.hasAccount')}{' '}
          <Link to="/login" className="font-semibold text-sage-600 hover:text-sage-700 transition-colors">
            {t('register.loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
