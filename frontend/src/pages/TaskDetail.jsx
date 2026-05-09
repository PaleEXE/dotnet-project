import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../App';
import { useI18n } from '../i18n/I18nContext';
import ProfileAvatar from '../components/ProfileAvatar';
import TaskImageGallery from '../components/TaskImageGallery';

export default function TaskDetail({ user }) {
  const { t } = useI18n();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [message, setMessage] = useState('');

  // Org log hours state
  const [logFormUserId, setLogFormUserId] = useState(null);
  const [logHours, setLogHours] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [hoursLog, setHoursLog] = useState([]);

  useEffect(() => {
    fetch(`${API}/tasks/${id}`).then(r => r.json()).then(setTask);
    fetch(`${API}/volunteers/task/${id}`).then(r => r.json()).then(setVolunteers);
    loadHoursLog();
  }, [id]);

  const loadHoursLog = () => {
    fetch(`${API}/hours/task/${id}`).then(r => r.json()).then(setHoursLog);
  };

  useEffect(() => {
    if (user.role === 'student' && volunteers.length > 0) {
      setAlreadyApplied(volunteers.some(v => v.user_id === user.id));
    }
  }, [user, volunteers]);

  const handleApply = async () => {
    const res = await fetch(`${API}/volunteers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: parseInt(id), user_id: user.id }),
    });
    if (res.ok) {
      setAlreadyApplied(true);
      setMessage(t('taskDetail.applicationSubmitted'));
      fetch(`${API}/volunteers/task/${id}`).then(r => r.json()).then(setVolunteers);
    } else {
      const data = await res.json();
      setMessage(data.message || t('taskDetail.applicationFailed'));
    }
  };

  const handleStatus = async (volunteerId, status) => {
    await fetch(`${API}/volunteers/${volunteerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetch(`${API}/volunteers/task/${id}`).then(r => r.json()).then(setVolunteers);
  };

  const handleLogHours = async (volunteerUserId) => {
    setMessage('');
    const res = await fetch(`${API}/hours/org`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organization_id: user.id,
        task_id: parseInt(id),
        user_id: volunteerUserId,
        hours_worked: parseFloat(logHours),
        notes: logNotes.trim() || null,
      }),
    });

    if (res.ok) {
      setMessage(t('taskDetail.hoursLoggedSuccess'));
      setLogFormUserId(null);
      setLogHours('');
      setLogNotes('');
      loadHoursLog();
    } else {
      const data = await res.json();
      setMessage(data.message || t('taskDetail.hoursLoggedFailed'));
    }
  };

  const getVolunteerHours = (user_id) => hoursLog.filter(h => h.user_id === user_id);

  if (!task) return <div className="py-20 text-center text-earth font-medium">{t('taskDetail.loading')}</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      
      <div className="bg-white rounded-2xl shadow-sm border border-sand overflow-hidden">
        {/* Cover Images */}
        {task.task_images && task.task_images.length > 0 && (
          <TaskImageGallery images={task.task_images} mode="detail" />
        )}

        <div className="p-8">
          <div className="flex items-baseline justify-between mb-4">
            <h1 className="text-3xl font-bold text-ink tracking-tight">{task.title}</h1>
            <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-full ${
              task.status === 'open' ? 'bg-sage-100 text-sage-800' : 
              task.status === 'closed' ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {task.status}
            </span>
          </div>

          {task.task_tags && task.task_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {task.task_tags.map(tt => (
                <span key={tt.tag_id} className="bg-slate-100 text-earth px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                  {tt.tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="prose prose-slate max-w-none text-ink leading-relaxed mb-8">
            <p>{task.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 bg-offwhite p-6 rounded-2xl border border-slate-100">
            {task.organization && (
              <div>
                <p className="text-sm font-semibold text-earth uppercase tracking-wider mb-1">{t('taskDetail.organization')}</p>
                <Link to={`/organizations/${task.organization_id}`} className="font-medium text-sage-700 hover:text-sage-800 transition-colors">
                  {task.organization.name}
                </Link>
              </div>
            )}
            {task.max_volunteers && (
              <div>
                <p className="text-sm font-semibold text-earth uppercase tracking-wider mb-1">{t('taskDetail.volunteersNeeded')}</p>
                <p className="font-medium text-ink">{task.max_volunteers}</p>
              </div>
            )}
            {task.start_date && (
              <div>
                <p className="text-sm font-semibold text-earth uppercase tracking-wider mb-1">{t('taskDetail.start_date')}</p>
                <p className="font-medium text-ink">{new Date(task.start_date).toLocaleDateString()}</p>
              </div>
            )}
            {task.end_date && (
              <div>
                <p className="text-sm font-semibold text-earth uppercase tracking-wider mb-1">{t('taskDetail.end_date')}</p>
                <p className="font-medium text-ink">{new Date(task.end_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {message && (
         <div className="bg-sage-50 border-l-4 border-sage-500 p-4 rounded-r-md animate-slide-up">
           <p className="text-sm text-sage-700 font-medium">{message}</p>
         </div>
      )}

      {/* Action Button for Students */}
      {user.role === 'student' && !alreadyApplied && task.status === 'open' && (
        <button 
          className="w-full sm:w-auto px-8 py-3 bg-sage hover:bg-sage-hover text-white font-semibold rounded-2xl shadow-sm transition-colors text-lg"
          onClick={handleApply}
        >
          {t('taskDetail.volunteerBtn')}
        </button>
      )}
      
      {user.role === 'student' && alreadyApplied && (
        <div className="bg-sage-50 border border-sage-200 text-sage-800 p-4 rounded-2xl flex items-center">
          <svg className="w-6 h-6 mr-3 text-sage-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-medium">{t('taskDetail.alreadyApplied')}</span>
        </div>
      )}

      {/* Volunteers List for Organizations */}
      {user.role === 'organization' && (
        <div className="pt-6">
          <h2 className="text-2xl font-bold text-ink mb-6 border-b border-sand pb-2">{t('taskDetail.volunteersTitle')} ({volunteers.length})</h2>
          
          {volunteers.length === 0 ? (
            <p className="text-earth italic">{t('taskDetail.noVolunteers')}</p>
          ) : (
            <div className="space-y-4 stagger-children">
              {volunteers.map(v => {
                const vHours = getVolunteerHours(v.user_id);
                const totalHours = vHours.reduce((s, h) => s + h.hours_worked, 0);

                return (
                  <div key={v.id} className="bg-white rounded-2xl shadow-sm border border-sand overflow-hidden animate-slide-up">
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar
                          src={v.user?.profile_picture_url}
                          name={v.user?.full_name || `User #${v.user_id}`}
                          size="md"
                        />
                        <div>
                          <p className="font-bold text-ink text-lg">{v.user?.full_name || `User #${v.user_id}`}</p>
                          <p className="text-sm text-earth mt-1">{t('taskDetail.applied')}: {new Date(v.joined_at).toLocaleDateString()}</p>
                          {totalHours > 0 && (
                            <p className="text-sm text-sage-600 font-semibold mt-1 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              {totalHours.toFixed(1)} {t('taskDetail.hoursLogged')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                          v.status === 'approved' ? 'bg-sage-100 text-sage-800' :
                          v.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {v.status}
                        </span>

                        {v.status === 'pending' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleStatus(v.id, 'approved')}
                              className="px-3 py-1.5 bg-sage hover:bg-sage-hover text-white text-sm font-semibold rounded transition-colors"
                            >
                              {t('taskDetail.approve')}
                            </button>
                            <button 
                              onClick={() => handleStatus(v.id, 'rejected')}
                              className="px-3 py-1.5 bg-white border border-red-300 text-red-700 hover:bg-red-50 text-sm font-semibold rounded transition-colors"
                            >
                              {t('taskDetail.reject')}
                            </button>
                          </div>
                        )}

                        {v.status === 'approved' && logFormUserId !== v.user_id && (
                          <button
                            onClick={() => { setLogFormUserId(v.user_id); setLogHours(''); setLogNotes(''); }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-sage-50 text-sage-700 border border-sand hover:border-sage-200 text-sm font-semibold rounded transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            {t('taskDetail.logHours')}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Log Hours Form (inline, for this volunteer) */}
                    {logFormUserId === v.user_id && (
                      <div className="border-t border-sand bg-offwhite p-5 animate-slide-down">
                        <h4 className="text-sm font-bold text-ink mb-4 uppercase tracking-wider">
                          {t('taskDetail.logHoursFor')} {v.user?.full_name || `User #${v.user_id}`}
                        </h4>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-ink mb-1">{t('taskDetail.hours_worked')}</label>
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              value={logHours}
                              onChange={e => setLogHours(e.target.value)}
                              placeholder="e.g. 2.5"
                              className="w-full px-3 py-2 rounded-2xl border border-sand focus:ring-sage-500 focus:border-sage-500 text-sm"
                            />
                          </div>
                          <div className="flex-[2]">
                            <label className="block text-xs font-semibold text-ink mb-1">{t('taskDetail.noteOptional')}</label>
                            <input
                              type="text"
                              value={logNotes}
                              onChange={e => setLogNotes(e.target.value)}
                              placeholder={t('taskDetail.notePlaceholder')}
                              className="w-full px-3 py-2 rounded-2xl border border-sand focus:ring-sage-500 focus:border-sage-500 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => handleLogHours(v.user_id)}
                            className="px-4 py-2 bg-sage hover:bg-sage-hover text-white text-sm font-semibold rounded-2xl transition-colors"
                          >
                            {t('taskDetail.submitHours')}
                          </button>
                          <button
                            onClick={() => setLogFormUserId(null)}
                            className="px-4 py-2 bg-white border border-sand hover:bg-offwhite text-ink text-sm font-semibold rounded-2xl transition-colors"
                          >
                            {t('taskDetail.cancel')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Show logged hours for this volunteer */}
                    {vHours.length > 0 && (
                      <div className="border-t border-slate-100 bg-offwhite/50 px-5 py-3">
                        <div className="space-y-1.5">
                          {vHours.map(h => (
                            <div key={h.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sage-700">{h.hours_worked}h</span>
                                {h.notes && <span className="text-earth">— {h.notes}</span>}
                              </div>
                              <span className="text-xs text-slate-400">{new Date(h.recorded_at).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
