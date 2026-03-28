import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';

export default function Home({ user, token }) {
  const [tasks, setTasks] = useState([]);
  const [orgProfile, setOrgProfile] = useState(null);

  useEffect(() => {
    if (user.role === 'student') {
      fetch(`${API}/tasks/open`)
        .then(r => r.json())
        .then(setTasks);
    } else {
      // Fetch org profile first, then get their tasks
      fetch(`${API}/organizations`)
        .then(r => r.json())
        .then(orgs => {
          const mine = orgs.find(o => o.userId === user.id);
          setOrgProfile(mine);
          if (mine) {
            fetch(`${API}/tasks`)
              .then(r => r.json())
              .then(all => setTasks(all.filter(t => t.orgId === mine.id)));
          }
        });
    }
  }, [user]);

  if (user.role === 'student') {
    return (
      <div className="page">
        <h1>Open Volunteer Tasks</h1>
        {tasks.length === 0 && <p>No open tasks right now.</p>}
        {tasks.map(t => (
          <div className="card" key={t.id}>
            <h3><Link to={`/tasks/${t.id}`} className="link">{t.title}</Link></h3>
            <p>{t.description}</p>
            <p>
              {t.startDate && <>Start: {t.startDate.split('T')[0]}</>}
              {t.endDate && <> &nbsp;|&nbsp; End: {t.endDate.split('T')[0]}</>}
            </p>
            {t.volunteersNeeded && <p>Volunteers needed: {t.volunteersNeeded}</p>}
            <div style={{ marginTop: 8 }}>
              <Link to={`/tasks/${t.id}`} className="btn btn-primary btn-small">View Details</Link>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="page">
      <h1>My Organization's Tasks</h1>
      <Link to="/tasks/new" className="btn btn-primary" style={{ marginBottom: 20, display: 'inline-block' }}>+ Post New Task</Link>
      {tasks.length === 0 && <p>You haven't posted any tasks yet.</p>}
      {tasks.map(t => (
        <div className="card" key={t.id}>
          <h3>
            <Link to={`/tasks/${t.id}`} className="link">{t.title}</Link>
            <span className={`badge badge-${t.status}`} style={{ marginLeft: 10 }}>{t.status}</span>
          </h3>
          <p>{t.description}</p>
          <p>
            {t.startDate && <>Start: {t.startDate.split('T')[0]}</>}
            {t.endDate && <> &nbsp;|&nbsp; End: {t.endDate.split('T')[0]}</>}
          </p>
        </div>
      ))}
    </div>
  );
}
