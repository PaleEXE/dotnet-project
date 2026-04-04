import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';

export default function MyApplications({ user }) {
  const [volunteers, setVolunteers] = useState([]);
  const [logFormId, setLogFormId] = useState(null);
  const [workDate, setWorkDate] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API}/volunteers/user/${user.id}`)
      .then(r => r.json())
      .then(setVolunteers);
  }, [user]);

  const handleLogHours = async (taskId) => {
    setMessage('');
    const res = await fetch(`${API}/hours`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: taskId,
        userId: user.id,
        hoursWorked: parseFloat(hours),
        recordedAt: workDate ? new Date(workDate).toISOString() : new Date().toISOString(),
        notes,
      }),
    });

    if (res.ok) {
      setMessage('Hours logged successfully!');
      setLogFormId(null);
      setWorkDate('');
      setHours('');
      setNotes('');
    } else {
      const data = await res.json();
      setMessage(data.message || 'Failed to log hours');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Volunteering</h1>
        <p className="text-slate-500 mt-2">Track the tasks you've joined and log your hours</p>
      </div>

      {message && (
         <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-6 rounded-r-md">
           <p className="text-sm text-emerald-700 font-medium">{message}</p>
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

                {v.status === 'approved' && logFormId !== v.id && (
                  <button
                    className="mt-6 px-4 py-2 bg-slate-100 hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-200 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                    onClick={() => setLogFormId(v.id)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Log Hours
                  </button>
                )}

                {/* Log Hours Form */}
                {logFormId === v.id && (
                  <div className="mt-6 bg-slate-50 border border-slate-200 p-5 rounded-lg max-w-lg">
                    <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Log Time Entry</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                          <input 
                            type="date" 
                            value={workDate} 
                            onChange={e => setWorkDate(e.target.value)} 
                            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Hours</label>
                          <input 
                            type="number" 
                            step="0.5" 
                            min="0.5" 
                            value={hours} 
                            onChange={e => setHours(e.target.value)} 
                            required 
                            placeholder="e.g. 2.5"
                            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                        <textarea 
                          value={notes} 
                          onChange={e => setNotes(e.target.value)} 
                          rows="2"
                          className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                          placeholder="What did you accomplish?"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={() => handleLogHours(v.taskId)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md transition-colors"
                        >
                          Submit Log
                        </button>
                        <button 
                          onClick={() => setLogFormId(null)}
                          className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-md transition-colors"
                        >
                          Cancel
                        </button>
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
