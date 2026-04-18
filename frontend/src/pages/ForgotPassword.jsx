import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../App';
import { useI18n } from '../i18n/I18nContext';

export default function ForgotPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const res = await fetch(`${API}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phoneNumber, universityId, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || t('forgotPassword.failed'));
      return;
    }

    setSuccess(t('forgotPassword.success'));
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-100 p-8 animate-scale-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{t('forgotPassword.title')}</h1>
        <p className="text-slate-500 text-sm">{t('forgotPassword.subtitle')}</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md error-banner">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-6 rounded-r-md animate-slide-up">
          <p className="text-sm text-emerald-700 font-medium">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('forgotPassword.email')}</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('forgotPassword.phone')}</label>
          <input 
            type="tel" 
            value={phoneNumber} 
            onChange={e => setPhoneNumber(e.target.value)} 
            required 
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700"
            placeholder="+1234567890"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('forgotPassword.universityId')}</label>
          <input 
            type="text" 
            value={universityId} 
            onChange={e => setUniversityId(e.target.value)} 
            required 
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700"
            placeholder="UID12345"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('forgotPassword.newPassword')}</label>
          <input 
            type="password" 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
            required 
            minLength={6}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          {t('forgotPassword.submit')}
        </button>
      </form>
      
      <div className="mt-8 text-center border-t border-slate-100 pt-6">
        <p className="text-sm text-slate-500">
          {t('forgotPassword.backToLogin')}{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
            {t('login.submit')}
          </Link>
        </p>
      </div>
    </div>
  );
}
