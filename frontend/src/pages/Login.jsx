import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../App';
import { useI18n } from '../i18n/I18nContext';

export default function Login({ onLogin }) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || t('login.failed'));
      return;
    }

    onLogin(data.user, data.token);
    navigate('/');
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8 animate-scale-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-ink mb-2">{t('login.title')}</h1>
        <p className="text-earth text-sm">{t('login.subtitle')}</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md error-banner">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">{t('login.email')}</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="w-full px-4 py-2.5 rounded-2xl border border-sand focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none transition-all text-ink"
            placeholder={t('login.emailPlaceholder')}
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">{t('login.password')}</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="w-full px-4 py-2.5 rounded-2xl border border-sand focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none transition-all text-ink"
            placeholder={t('login.passwordPlaceholder')}
          />
        </div>

        <button 
          type="submit" 
          className="w-full py-3 px-4 bg-sage hover:bg-sage-hover text-white font-semibold rounded-2xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500"
        >
          {t('login.submit')}
        </button>
      </form>
      
      <div className="mt-4 text-right">
        <Link to="/forgot-password" className="text-sm font-semibold text-sage-600 hover:text-sage-700 transition-colors">
          {t('login.forgotPassword')}
        </Link>
      </div>
      
      <div className="mt-8 text-center border-t border-slate-100 pt-6">
        <p className="text-sm text-earth">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="font-semibold text-sage-600 hover:text-sage-700 transition-colors">
            {t('login.registerLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
