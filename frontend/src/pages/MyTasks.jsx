import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';

export default function MyTasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
  
  // Edit Form State
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editMaxVolunteers, setEditMaxVolunteers] = useState('');
  
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = () => {
    fetch(`${API}/tasks`)
      .then(r => r.json())
      .then(all => setTasks(all.filter(t => t.organizationId === user.id)));
  };

  const startEdit = (task) => {
    setEditId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
    setEditMaxVolunteers(task.maxVolunteers || '');
  };

  const handleUpdate = async () => {
    setMessage('');
    const task = tasks.find(t => t.id === editId);
    const res = await fetch(`${API}/tasks/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...task,
        title: editTitle,
        description: editDescription,
        status: editStatus,
        maxVolunteers: editMaxVolunteers ? parseInt(editMaxVolunteers) : null,
      }),
    });

    if (res.ok) {
      setMessage('Task updated successfully.');
      setEditId(null);
      loadTasks();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-baseline mb-8 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Organization Tasks</h1>
          <p className="text-slate-500 mt-2">Manage opportunities you've listed</p>
        </div>
        <Link 
          to="/tasks/new" 
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Post New Task
        </Link>
      </div>

      {message && (
         <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-6 rounded-r-md">
           <p className="text-sm text-emerald-700 font-medium">{message}</p>
         </div>
      )}

      {tasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-lg">No tasks posted yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map(t => (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" key={t.id}>
              {editId === t.id ? (
                <div className="p-6 bg-slate-50">
                  <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Edit Task</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                      <input 
                        value={editTitle} 
                        onChange={e => setEditTitle(e.target.value)} 
                        className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                      <textarea 
                        value={editDescription} 
                        onChange={e => setEditDescription(e.target.value)} 
                        rows="3"
                        className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Volunteers Needed</label>
                        <input 
                          type="number" 
                          min="1" 
                          value={editMaxVolunteers} 
                          onChange={e => setEditMaxVolunteers(e.target.value)} 
                          className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                        <select 
                          value={editStatus} 
                          onChange={e => setEditStatus(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                        >
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-5 mt-2">
                    <button 
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md transition-colors" 
                      onClick={handleUpdate}
                    >
                      Save Changes
                    </button>
                    <button 
                      className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-md transition-colors" 
                      onClick={() => setEditId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-slate-800 line-clamp-2">{t.title}</h3>
                    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full shrink-0 ${
                      t.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 
                      t.status === 'closed' ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 mb-6 line-clamp-3 text-sm">{t.description}</p>
                  
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
                    <button 
                      className="flex-1 py-2 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-sm" 
                      onClick={() => startEdit(t)}
                    >
                      Edit
                    </button>
                    <Link 
                      to={`/tasks/${t.id}`} 
                      className="flex-1 py-2 text-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors text-sm"
                    >
                      Volunteers
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
