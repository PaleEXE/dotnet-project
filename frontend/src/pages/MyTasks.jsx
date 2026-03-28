import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';

export default function MyTasks({ user, token }) {
  const [tasks, setTasks] = useState([]);
  const [orgProfile, setOrgProfile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API}/organizations`)
      .then(r => r.json())
      .then(orgs => {
        const mine = orgs.find(o => o.userId === user.id);
        setOrgProfile(mine);
        if (mine) loadTasks(mine.id);
      });
  }, [user]);

  const loadTasks = (orgId) => {
    fetch(`${API}/tasks`)
      .then(r => r.json())
      .then(all => setTasks(all.filter(t => t.orgId === orgId)));
  };

  const startEdit = (task) => {
    setEditId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
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
      }),
    });

    if (res.ok) {
      setMessage('Task updated!');
      setEditId(null);
      if (orgProfile) loadTasks(orgProfile.id);
    }
  };

  return (
    <div className="page">
      <h1>My Tasks</h1>
      <Link to="/tasks/new" className="btn btn-primary" style={{ marginBottom: 20, display: 'inline-block' }}>+ Post New Task</Link>
      {message && <div className="success-msg">{message}</div>}
      {tasks.length === 0 && <p>No tasks posted yet.</p>}
      {tasks.map(t => (
        <div className="card" key={t.id}>
          {editId === t.id ? (
            <div>
              <div className="form-group">
                <label>Title</label>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                  <option value="open">open</option>
                  <option value="in_progress">in_progress</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
              <div className="btn-row">
                <button className="btn btn-primary btn-small" onClick={handleUpdate}>Save</button>
                <button className="btn btn-secondary btn-small" onClick={() => setEditId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h3>
                {t.title}
                <span className={`badge badge-${t.status}`} style={{ marginLeft: 10 }}>{t.status}</span>
              </h3>
              <p>{t.description}</p>
              <div className="btn-row">
                <button className="btn btn-primary btn-small" onClick={() => startEdit(t)}>Edit</button>
                <Link to={`/tasks/${t.id}`} className="btn btn-secondary btn-small">View Applicants</Link>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
