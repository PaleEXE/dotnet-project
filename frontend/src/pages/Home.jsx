import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';
import { useI18n } from '../i18n/I18nContext';
import TaskImageGallery from '../components/TaskImageGallery';

export default function Home({ user }) {
  const { t } = useI18n();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user.role === 'student' || user.role === 'admin') {
      fetch(`${API}/tasks/open`)
        .then(r => r.json())
        .then(setTasks);
    } else if (user.role === 'organization') {
      fetch(`${API}/tasks`)
        .then(r => r.json())
        .then(all => setTasks(all.filter(t => t.organizationId === user.id)));
    }
  }, [user]);

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    (t.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const TaskCard = ({ t: task }) => (
    <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 animate-fade-in border border-sand">
      {/* Image thumbnail */}
      {task.taskImages && task.taskImages.length > 0 && (
        <TaskImageGallery images={task.taskImages} mode="card" />
      )}

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-ink hover:text-sage transition-colors line-clamp-1">
            <Link to={`/tasks/${task.id}`}>{task.title}</Link>
          </h3>
          {user.role === 'organization' && (
            <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full ${
              task.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 
              task.status === 'closed' ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {task.status}
            </span>
          )}
        </div>
        
        {task.organization && (
          <div className="flex items-center text-sm text-earth mb-3 font-medium">
            <svg className="w-4 h-4 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span>{task.organization.name}</span>
          </div>
        )}
        
        <p className="text-ink/80 mb-5 line-clamp-2 text-sm leading-relaxed">{task.description}</p>
        
        <div className="flex flex-col space-y-2 mb-6">
          {(task.startDate || task.endDate) && (
            <div className="flex items-center text-sm text-slate-500">
              <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span>
                {task.startDate && new Date(task.startDate).toLocaleDateString()} 
                {task.startDate && task.endDate && ' — '} 
                {task.endDate && new Date(task.endDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {task.maxVolunteers && (
            <div className="flex items-center text-sm text-slate-500">
              <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              <span>{t('home.volunteersNeeded')}: {task.maxVolunteers}</span>
            </div>
          )}
        </div>

        {task.taskTags && task.taskTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {task.taskTags.map(tt => (
              <span key={tt.tagId} className="bg-sand/30 text-earth px-3 py-1 rounded-full text-xs font-semibold">
                {tt.tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="pt-2">
          <Link 
            to={`/tasks/${task.id}`} 
            className="inline-flex w-full justify-center items-center bg-sage text-white shadow-sm hover:bg-sage-hover px-4 py-3 rounded-2xl font-bold transition-all"
          >
            Join Now
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-lg mx-auto md:max-w-none">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-ink mb-1">
          Welcome back, {user.fullName ? user.fullName.split(' ')[0] : 'friend'}!
        </h1>
        <p className="text-earth font-medium">Let's make a difference today.</p>
      </div>

      {/* Impact Tracker */}
      {user.role === 'student' && (
        <div className="bg-sand rounded-[2rem] p-6 mb-8 shadow-sm flex justify-around items-center">
          <div className="text-center">
            <div className="text-3xl font-black text-ink mb-1">{(user.totalHours || 24)}</div>
            <div className="text-xs font-bold text-earth uppercase tracking-wider">Hours Volunteered</div>
          </div>
          <div className="w-px h-12 bg-white/50"></div>
          <div className="text-center">
            <div className="text-3xl font-black text-ink mb-1">5</div>
            <div className="text-xs font-bold text-earth uppercase tracking-wider">Communities Helped</div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-8 shadow-sm rounded-full bg-white border border-sand focus-within:border-sage transition-all">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search opportunities..." 
          className="w-full bg-transparent py-4 pl-12 pr-4 rounded-full text-ink outline-none placeholder:text-earth/60 font-medium"
        />
      </div>

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-ink">Top Opportunities</h2>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-sand/20 rounded-3xl border border-sand border-dashed p-12 text-center">
          <p className="text-earth font-medium text-lg">
            No opportunities found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filteredTasks.map(task => <TaskCard key={task.id} t={task} />)}
        </div>
      )}
    </div>
  );
}
