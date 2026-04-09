import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';

export default function MyApplications({ user }) {
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
              const taskHours = hours.filter(h => h.taskId === v.taskId);
              if (taskHours.length > 0) {
                setHoursByTask(prev => ({ ...prev, [v.taskId]: taskHours }));
              }
            });
        });
      });
  }, [user]);

  const totalHours = Object.values(hoursByTask).flat().reduce((sum, h) => sum + h.hoursWorked, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Volunteering</h1>
        <p className="text-slate-500 mt-2">Track the tasks you've joined and your logged hours</p>
      </div>

      {/* Hours Summary */}
      {totalHours > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Total Hours Logged</p>
            <p className="text-2xl font-bold text-emerald-900">{totalHours.toFixed(1)} hours</p>
          </div>
        </div>
      )}

      {volunteers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <p className="text-slate-500 text-lg">You haven't applied to any tasks yet.</p>
          <Link to="/" className="inline-block mt-4 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
            Browse open tasks &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {volunteers.map(v => (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 justify-between items-start" key={v.id}>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-slate-800 line-clamp-1">
                    <Link to={`/tasks/${v.taskId}`} className="hover:text-emerald-700 transition-colors">
                      {v.task?.title || `Task #${v.taskId}`}
                    </Link>
                  </h3>
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full shrink-0 ${
                    v.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    v.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {v.status}
                  </span>
                </div>
                
                <p className="text-sm text-slate-500 flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  Joined: {v.joinedAt?.split('T')[0]}
                </p>

                {/* Show logged hours for approved volunteers */}
                {v.status === 'approved' && hoursByTask[v.taskId] && hoursByTask[v.taskId].length > 0 && (
                  <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Logged Hours
                    </h4>
                    <div className="space-y-2">
                      {hoursByTask[v.taskId].map(h => (
                        <div key={h.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-emerald-700">{h.hoursWorked}h</span>
                            {h.notes && <span className="text-slate-500">— {h.notes}</span>}
                          </div>
                          <span className="text-xs text-slate-400">{new Date(h.recordedAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between text-sm font-semibold">
                        <span className="text-slate-700">Total</span>
                        <span className="text-emerald-700">{hoursByTask[v.taskId].reduce((s, h) => s + h.hoursWorked, 0).toFixed(1)}h</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="shrink-0 pt-1 md:pt-0 border-t md:border-none border-slate-100 w-full md:w-auto mt-4 md:mt-0">
                <Link to={`/tasks/${v.taskId}`} className="inline-block w-full text-center px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
                  View Task
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
