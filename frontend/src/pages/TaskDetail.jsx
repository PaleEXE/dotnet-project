import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../App';

export default function TaskDetail({ user }) {
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
      setAlreadyApplied(volunteers.some(v => v.userId === user.id));
    }
  }, [user, volunteers]);

  const handleApply = async () => {
    const res = await fetch(`${API}/volunteers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: parseInt(id), userId: user.id }),
    });
    if (res.ok) {
      setAlreadyApplied(true);
      setMessage('Volunteer application submitted!');
      fetch(`${API}/volunteers/task/${id}`).then(r => r.json()).then(setVolunteers);
    } else {
      const data = await res.json();
      setMessage(data.message || 'Failed to apply');
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
        organizationId: user.id,
        taskId: parseInt(id),
        userId: volunteerUserId,
        hoursWorked: parseFloat(logHours),
        notes: logNotes.trim() || null,
      }),
    });

    if (res.ok) {
      setMessage('Hours logged successfully!');
      setLogFormUserId(null);
      setLogHours('');
      setLogNotes('');
      loadHoursLog();
    } else {
      const data = await res.json();
      setMessage(data.message || 'Failed to log hours');
    }
  };

  const getVolunteerHours = (userId) => hoursLog.filter(h => h.userId === userId);

  if (!task) return <div className="py-20 text-center text-slate-500 font-medium">Loading task details...</div>;

  return (
    <div className="space-y-8">
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Cover Images */}
        {task.taskImages && task.taskImages.length > 0 && (
          <div className="h-64 w-full bg-slate-100 border-b border-slate-200 overflow-hidden relative">
            <div className="flex h-full w-full overflow-x-auto snap-x">
              {task.taskImages.map(img => (
                <img key={img.id} src={img.imageUrl} alt="Task visual" className="h-full object-cover min-w-full snap-start" />
              ))}
            </div>
            {task.taskImages.length > 1 && (
               <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                 {task.taskImages.length} images
               </div>
            )}
          </div>
        )}

        <div className="p-8">
          <div className="flex items-baseline justify-between mb-4">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{task.title}</h1>
            <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-full ${
              task.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 
              task.status === 'closed' ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {task.status}
            </span>
          </div>

          {task.taskTags && task.taskTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {task.taskTags.map(tt => (
                <span key={tt.tagId} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                  {tt.tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-8">
            <p>{task.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 bg-slate-50 p-6 rounded-lg border border-slate-100">
            {task.organization && (
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Organization</p>
                <Link to={`/organizations/${task.organizationId}`} className="font-medium text-emerald-700 hover:text-emerald-800 transition-colors">
                  {task.organization.name}
                </Link>
              </div>
            )}
            {task.maxVolunteers && (
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Volunteers Needed</p>
                <p className="font-medium text-slate-900">{task.maxVolunteers}</p>
              </div>
            )}
            {task.startDate && (
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Start Date</p>
                <p className="font-medium text-slate-900">{new Date(task.startDate).toLocaleDateString()}</p>
              </div>
            )}
            {task.endDate && (
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">End Date</p>
                <p className="font-medium text-slate-900">{new Date(task.endDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {message && (
         <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-md">
           <p className="text-sm text-emerald-700 font-medium">{message}</p>
         </div>
      )}

      {/* Action Button for Students */}
      {user.role === 'student' && !alreadyApplied && task.status === 'open' && (
        <button 
          className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-lg"
          onClick={handleApply}
        >
          Volunteer for this Task
        </button>
      )}
      
      {user.role === 'student' && alreadyApplied && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center">
          <svg className="w-6 h-6 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-medium">You are actively volunteering for this task.</span>
        </div>
      )}

      {/* Volunteers List for Organizations */}
      {user.role === 'organization' && (
        <div className="pt-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2">Registered Volunteers ({volunteers.length})</h2>
          
          {volunteers.length === 0 ? (
            <p className="text-slate-500 italic">No volunteers have registered yet.</p>
          ) : (
            <div className="space-y-4">
              {volunteers.map(v => {
                const vHours = getVolunteerHours(v.userId);
                const totalHours = vHours.reduce((s, h) => s + h.hoursWorked, 0);

                return (
                  <div key={v.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-800 text-lg">{v.user?.fullName || `User #${v.userId}`}</p>
                        <p className="text-sm text-slate-500 mt-1">Applied: {new Date(v.joinedAt).toLocaleDateString()}</p>
                        {totalHours > 0 && (
                          <p className="text-sm text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {totalHours.toFixed(1)} hours logged
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                          v.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          v.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {v.status}
                        </span>

                        {v.status === 'pending' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleStatus(v.id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleStatus(v.id, 'rejected')}
                              className="px-3 py-1.5 bg-white border border-red-300 text-red-700 hover:bg-red-50 text-sm font-semibold rounded transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {v.status === 'approved' && logFormUserId !== v.userId && (
                          <button
                            onClick={() => { setLogFormUserId(v.userId); setLogHours(''); setLogNotes(''); }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-200 text-sm font-semibold rounded transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            Log Hours
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Log Hours Form (inline, for this volunteer) */}
                    {logFormUserId === v.userId && (
                      <div className="border-t border-slate-200 bg-slate-50 p-5">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
                          Log Hours for {v.user?.fullName || `User #${v.userId}`}
                        </h4>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Hours Worked</label>
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              value={logHours}
                              onChange={e => setLogHours(e.target.value)}
                              placeholder="e.g. 2.5"
                              className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            />
                          </div>
                          <div className="flex-[2]">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Note (Optional)</label>
                            <input
                              type="text"
                              value={logNotes}
                              onChange={e => setLogNotes(e.target.value)}
                              placeholder="What did they work on?"
                              className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => handleLogHours(v.userId)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md transition-colors"
                          >
                            Submit Hours
                          </button>
                          <button
                            onClick={() => setLogFormUserId(null)}
                            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-md transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Show logged hours for this volunteer */}
                    {vHours.length > 0 && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                        <div className="space-y-1.5">
                          {vHours.map(h => (
                            <div key={h.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-emerald-700">{h.hoursWorked}h</span>
                                {h.notes && <span className="text-slate-500">— {h.notes}</span>}
                              </div>
                              <span className="text-xs text-slate-400">{new Date(h.recordedAt).toLocaleDateString()}</span>
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
