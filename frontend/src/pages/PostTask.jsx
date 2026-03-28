import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../App';

export default function PostTask({ user, token }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [volunteersNeeded, setVolunteersNeeded] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [orgId, setOrgId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/organizations`)
      .then(r => r.json())
      .then(orgs => {
        const mine = orgs.find(o => o.userId === user.id);
        if (mine) setOrgId(mine.id);
      });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!orgId) { setError('Organization profile not found'); return; }

    const body = {
      orgId,
      title,
      description,
      volunteersNeeded: volunteersNeeded ? parseInt(volunteersNeeded) : null,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    const res = await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      navigate('/');
    } else {
      const data = await res.json();
      setError(data.message || 'Failed to create task');
    }
  };

  return (
    <div className="page">
      <h1>Post a New Task</h1>
      {error && <div className="error-msg">{error}</div>}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Volunteers Needed (optional)</label>
            <input type="number" min="1" value={volunteersNeeded} onChange={e => setVolunteersNeeded(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Post Task</button>
        </form>
      </div>
    </div>
  );
}
