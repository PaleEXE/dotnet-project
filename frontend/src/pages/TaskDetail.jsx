import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../App';

export default function TaskDetail({ user, token }) {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [applications, setApplications] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API}/tasks/${id}`).then(r => r.json()).then(setTask);
    fetch(`${API}/applications/task/${id}`).then(r => r.json()).then(setApplications);

    if (user.role === 'student') {
      fetch(`${API}/students`)
        .then(r => r.json())
        .then(students => {
          const mine = students.find(s => s.userId === user.id);
          setStudentProfile(mine);
        });
    }
  }, [id, user]);

  useEffect(() => {
    if (studentProfile && applications.length > 0) {
      setAlreadyApplied(applications.some(a => a.studentId === studentProfile.id));
    }
  }, [studentProfile, applications]);

  const handleApply = async () => {
    if (!studentProfile) return;
    const res = await fetch(`${API}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: parseInt(id), studentId: studentProfile.id }),
    });
    if (res.ok) {
      setAlreadyApplied(true);
      setMessage('Application submitted!');
      fetch(`${API}/applications/task/${id}`).then(r => r.json()).then(setApplications);
    } else {
      const data = await res.json();
      setMessage(data.message || 'Failed to apply');
    }
  };

  const handleStatus = async (appId, status) => {
    await fetch(`${API}/applications/${appId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetch(`${API}/applications/task/${id}`).then(r => r.json()).then(setApplications);
  };

  if (!task) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>{task.title}</h1>
      <span className={`badge badge-${task.status}`}>{task.status}</span>

      <div className="card" style={{ marginTop: 16 }}>
        <p><strong>Description:</strong> {task.description}</p>
        {task.volunteersNeeded && <p><strong>Volunteers needed:</strong> {task.volunteersNeeded}</p>}
        {task.startDate && <p><strong>Start date:</strong> {task.startDate.split('T')[0]}</p>}
        {task.endDate && <p><strong>End date:</strong> {task.endDate.split('T')[0]}</p>}
        {task.organization && <p><strong>Organization:</strong> {task.organization.name}</p>}
      </div>

      {message && <div className="success-msg">{message}</div>}

      {user.role === 'student' && !alreadyApplied && task.status === 'open' && (
        <button className="btn btn-primary" onClick={handleApply} style={{ marginTop: 12 }}>
          Apply to this Task
        </button>
      )}
      {user.role === 'student' && alreadyApplied && (
        <p style={{ marginTop: 12, color: '#2e7d32', fontWeight: 500 }}>You have already applied to this task.</p>
      )}

      {user.role === 'organization' && (
        <div style={{ marginTop: 24 }}>
          <h2>Applicants ({applications.length})</h2>
          {applications.length === 0 && <p>No applications yet.</p>}
          {applications.map(a => (
            <div className="card" key={a.id}>
              <p><strong>{a.student?.fullName || `Student #${a.studentId}`}</strong></p>
              <span className={`badge badge-${a.status}`}>{a.status}</span>
              {a.status === 'pending' && (
                <div className="btn-row">
                  <button className="btn btn-primary btn-small" onClick={() => handleStatus(a.id, 'accepted')}>Accept</button>
                  <button className="btn btn-danger btn-small" onClick={() => handleStatus(a.id, 'rejected')}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
