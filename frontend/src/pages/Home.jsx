import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';

export default function Home({ user }) {
  const [tasks, setTasks] = useState([]);

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

  const TaskCard = ({ t }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-slate-800">
            <Link to={`/tasks/${t.id}`} className="hover:text-emerald-700 transition-colors">
              {t.title}
            </Link>
          </h3>
          {user.role === 'organization' && (
            <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full ${
              t.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 
              t.status === 'closed' ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {t.status}
            </span>
          )}
        </div>
        
        <p className="text-slate-600 mb-6 line-clamp-3">{t.description}</p>
        
        <div className="flex flex-col space-y-2 mb-6">
          {(t.startDate || t.endDate) && (
            <div className="flex items-center text-sm text-slate-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span>
                {t.startDate && new Date(t.startDate).toLocaleDateString()} 
                {t.startDate && t.endDate && ' — '} 
                {t.endDate && new Date(t.endDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {t.maxVolunteers && (
            <div className="flex items-center text-sm text-slate-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              <span>Volunteers needed: {t.maxVolunteers}</span>
            </div>
          )}
        </div>

        {t.taskTags && t.taskTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {t.taskTags.map(tt => (
              <span key={tt.tagId} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                {tt.tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="pt-2">
          <Link 
            to={`/tasks/${t.id}`} 
            className="inline-flex w-full justify-center items-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 mt-2 rounded-lg text-sm font-semibold transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-baseline mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          {user.role === 'organization' ? "My Organization's Tasks" : "Open Volunteer Tasks"}
        </h1>
        {user.role === 'organization' && (
          <Link 
            to="/tasks/new" 
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Post New Task
          </Link>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-lg">
            {user.role === 'organization' ? "You haven't posted any tasks yet." : "No open tasks right now."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map(t => <TaskCard key={t.id} t={t} />)}
        </div>
      )}
    </div>
  );
}
