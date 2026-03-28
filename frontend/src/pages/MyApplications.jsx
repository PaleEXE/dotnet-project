import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';

export default function MyApplications({ user, token }) {
  const [applications, setApplications] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [logFormId, setLogFormId] = useState(null);
  const [workDate, setWorkDate] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API}/students`)
      .then(r => r.json())
      .then(students => {
        const mine = students.find(s => s.userId === user.id);
        setStudentProfile(mine);
        if (mine) {
          fetch(`${API}/applications/student/${mine.id}`)
            .then(r => r.json())
            .then(setApplications);
        }
      });
  }, [user]);

  const handleLogHours = async (appId) => {
    setMessage('');
    const res = await fetch(`${API}/worklogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: appId,
        hoursWorked: parseFloat(hours),
        workDate,
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
    <div className="page">
      <h1>My Applications</h1>
      {message && <div className="success-msg">{message}</div>}
      {applications.length === 0 && <p>You haven't applied to any tasks yet.</p>}
      {applications.map(a => (
        <div className="card" key={a.id}>
          <h3>
            <Link to={`/tasks/${a.taskId}`} className="link">
              {a.task?.title || `Task #${a.taskId}`}
            </Link>
          </h3>
          <span className={`badge badge-${a.status}`}>{a.status}</span>
          <p style={{ marginTop: 6, fontSize: 13, color: '#888' }}>
            Applied: {a.appliedAt?.split('T')[0]}
          </p>

          {a.status === 'accepted' && logFormId !== a.id && (
            <button
              className="btn btn-primary btn-small"
              style={{ marginTop: 8 }}
              onClick={() => setLogFormId(a.id)}
            >
              Log Hours
            </button>
          )}

          {logFormId === a.id && (
            <div className="inline-form">
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={workDate} onChange={e => setWorkDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Hours Worked</label>
                <input type="number" step="0.5" min="0.5" value={hours} onChange={e => setHours(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div className="btn-row">
                <button className="btn btn-primary btn-small" onClick={() => handleLogHours(a.id)}>Submit</button>
                <button className="btn btn-secondary btn-small" onClick={() => setLogFormId(null)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
