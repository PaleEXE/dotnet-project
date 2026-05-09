import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';
import { useI18n } from '../i18n/I18nContext';

export default function MyApplications({ user }) {
  const { t } = useI18n();
  const [volunteers, setVolunteers] = useState([]);
  const [hoursByTask, setHoursByTask] = useState({});

  useEffect(() => {
    fetch(`${API}/volunteers/user/${user.id}`)
      .then(r => r.json())
      .then(data => {
        setVolunteers(data);
        // Load hours for each approved task
        data.filter(v => v.status === 'approved').forEach(v => {
          fetch(`${API}/hours/user/${user.id}`)
            .then(r => r.json())
            .then(hours => {
              const taskHours = hours.filter(h => h.task_id === v.task_id);
              if (taskHours.length > 0) {
                setHoursByTask(prev => ({ ...prev, [v.task_id]: taskHours }));
              }
            });
        });
      });
  }, [user]);

  const totalHours = Object.values(hoursByTask).flat().reduce((sum, h) => sum + h.hours_worked, 0);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8 border-b border-sand pb-4">
        <h1 className="text-3xl font-bold text-ink tracking-tight">{t('myApplications.title')}</h1>
        <p className="text-earth mt-2">{t('myApplications.subtitle')}</p>
      </div>

      {/* Hours Summary */}
      {totalHours > 0 && (
        <div className="bg-sage-50 border border-sage-200 rounded-2xl p-5 mb-6 flex items-center gap-4 animate-slide-up">
          <div className="w-12 h-12 bg-sage-100 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-sage-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-sage-800 uppercase tracking-wider">{t('myApplications.totalHoursLogged')}</p>
            <p className="text-2xl font-bold text-sage-900">{totalHours.toFixed(1)} {t('myApplications.hours')}</p>
          </div>
        </div>
      )}

      {volunteers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-sand p-12 text-center">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <p className="text-earth text-lg">{t('myApplications.noApplications')}</p>
          <Link to="/" className="inline-block mt-4 text-sage-600 hover:text-sage-700 font-semibold transition-colors">
            {t('myApplications.browseOpen')} &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-6 stagger-children">
          {volunteers.map(v => (
            <div className="bg-white rounded-2xl shadow-sm border border-sand p-6 flex flex-col md:flex-row gap-6 justify-between items-start animate-slide-up card-hover" key={v.id}>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-ink line-clamp-1">
                    <Link to={`/tasks/${v.task_id}`} className="hover:text-sage-700 transition-colors">
                      {v.task?.title || `Task #${v.task_id}`}
                    </Link>
                  </h3>
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full shrink-0 ${
                    v.status === 'approved' ? 'bg-sage-100 text-sage-800' :
                    v.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {v.status}
                  </span>
                </div>
                
                <p className="text-sm text-earth flex items-center">
                  <svg className="w-4 h-4 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  {t('myApplications.joined')}: {v.joined_at?.split('T')[0]}
                </p>

                {/* Show logged hours for approved volunteers */}
                {v.status === 'approved' && hoursByTask[v.task_id] && hoursByTask[v.task_id].length > 0 && (
                  <div className="mt-4 bg-offwhite border border-sand rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {t('myApplications.loggedHours')}
                    </h4>
                    <div className="space-y-2">
                      {hoursByTask[v.task_id].map(h => (
                        <div key={h.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sage-700">{h.hours_worked}h</span>
                            {h.notes && <span className="text-earth">— {h.notes}</span>}
                          </div>
                          <span className="text-xs text-slate-400">{new Date(h.recorded_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 border-t border-sand flex justify-between text-sm font-semibold">
                        <span className="text-ink">{t('myApplications.total')}</span>
                        <span className="text-sage-700">{hoursByTask[v.task_id].reduce((s, h) => s + h.hours_worked, 0).toFixed(1)}h</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="shrink-0 pt-1 md:pt-0 border-t md:border-none border-slate-100 w-full md:w-auto mt-4 md:mt-0">
                <Link to={`/tasks/${v.task_id}`} className="inline-block w-full text-center px-4 py-2 bg-white border border-sand hover:bg-offwhite text-ink text-sm font-semibold rounded-2xl transition-colors">
                  {t('myApplications.viewTask')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
