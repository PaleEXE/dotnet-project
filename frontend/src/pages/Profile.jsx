import { useState, useEffect } from 'react';
import { API } from '../App';
import { useI18n } from '../i18n/I18nContext';
import ProfileAvatar from '../components/ProfileAvatar';

export default function Profile({ user, setUser }) {
  const { t } = useI18n();
  const [profile, setProfile] = useState(null);
  const [workLogs, setWorkLogs] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`${API}/users/${user.id}`)
      .then(r => r.json())
      .then(setProfile);

    fetch(`${API}/hours/user/${user.id}`)
      .then(r => r.json())
      .then(setWorkLogs);
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API}/upload`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      const updatedProfile = { ...profile, profile_picture_url: data.url };
      
      await fetch(`${API}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      
      setProfile(updatedProfile);
      
      const saved = JSON.parse(localStorage.getItem('user'));
      if (saved) {
        saved.profile_picture_url = data.url;
        localStorage.setItem('user', JSON.stringify(saved));
        if (setUser) setUser(saved);
      }
    }
    setUploading(false);
  };

  if (!profile) return <div className="py-20 text-center text-earth font-medium">{t('profile.loading')}</div>;

  const totalHours = workLogs.reduce((sum, h) => sum + h.hours_worked, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
      
      {/* Profile Overview Card */}
      <div>
        <h1 className="text-3xl font-bold text-ink tracking-tight mb-6">{t('profile.title')}</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-sand p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
          
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative group">
              {uploading ? (
                <div className="w-24 h-24 rounded-full bg-sage-100 border-2 border-sage-200 flex items-center justify-center">
                  <span className="text-sm font-semibold text-sage-700 animate-pulse">{t('profile.uploading')}</span>
                </div>
              ) : (
                <ProfileAvatar
                  src={profile.profile_picture_url}
                  name={profile.full_name}
                  size="xl"
                  clickable={!!profile.profile_picture_url}
                />
              )}
              
              {!uploading && (
                <label title={t('profile.changePicture')} className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200 rounded-full">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">{t('profile.changePicture')}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-ink">{profile.full_name}</h2>
            <p className="text-earth mt-1">{profile.email}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mt-6">
              {profile.phone_number && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('profile.phone')}</p>
                  <p className="font-medium text-ink">{profile.phone_number}</p>
                </div>
              )}
              {profile.university_id && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('profile.university_id')}</p>
                  <p className="font-medium text-ink">{profile.university_id}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('profile.courseStatus')}</p>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${profile.taking_volunteering_course ? 'bg-sage-100 text-sage-800' : 'bg-slate-100 text-earth'}`}>
                  {profile.taking_volunteering_course ? t('profile.takingCourse') : t('profile.standardStudent')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-sage-50 rounded-2xl border border-sage-100 p-6 text-center shrink-0 min-w-[150px]">
            <p className="text-sm font-semibold text-sage-800 uppercase tracking-wider mb-1">{t('profile.totalHours')}</p>
            <p className="text-4xl font-black text-sage-600">
              {totalHours}
            </p>
          </div>
        </div>
      </div>

      {/* Logged Hours Table */}
      <div>
        <h2 className="text-2xl font-bold text-ink tracking-tight mb-4">{t('profile.loggedHours')}</h2>
        
        {workLogs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-sand p-10 text-center">
             <p className="text-earth text-lg">{t('profile.noHours')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-sand overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-offwhite">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-earth uppercase tracking-wider">{t('profile.task')}</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-earth uppercase tracking-wider">{t('profile.dateRecorded')}</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-earth uppercase tracking-wider text-right">{t('profile.hours')}</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-earth uppercase tracking-wider">{t('profile.notes')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {workLogs.map(w => (
                    <tr key={w.id} className="hover:bg-offwhite transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-ink">
                          {w.task?.title || `Task #${w.task_id}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-earth">
                        {w.recorded_at?.split('T')[0]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-sage-600 text-right">
                        {w.hours_worked} <span className="text-slate-400 font-normal ml-1">{t('admin.hrs')}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-earth max-w-[300px] truncate">
                        {w.notes || <span className="text-slate-400 italic">{t('profile.noNotes')}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
