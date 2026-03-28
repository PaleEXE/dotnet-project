import { useState, useEffect } from 'react';
import { API } from '../App';

export default function Profile({ user, token }) {
  const [student, setStudent] = useState(null);
  const [workLogs, setWorkLogs] = useState([]);

  useEffect(() => {
    fetch(`${API}/students`)
      .then(r => r.json())
      .then(students => {
        const mine = students.find(s => s.userId === user.id);
        setStudent(mine);
        if (mine) {
          fetch(`${API}/worklogs/student/${mine.id}`)
            .then(r => r.json())
            .then(setWorkLogs);
        }
      });
  }, [user]);

  if (!student) return <div className="page">Loading profile...</div>;

  return (
    <div className="page">
      <h1>My Profile</h1>
      <div className="card">
        <p><strong>Name:</strong> {student.fullName}</p>
        <p><strong>Student Number:</strong> {student.studentNumber || 'N/A'}</p>
        <p><strong>Volunteering Course:</strong> {student.volunteeringCourse ? 'Yes' : 'No'}</p>
        <p style={{ marginTop: 12, fontSize: 18 }}>
          <strong>Total Hours:</strong>{' '}
          <span style={{ color: '#2e7d32', fontWeight: 700 }}>{student.totalHours}</span>
        </p>
      </div>

      <h2 style={{ marginTop: 24 }}>Work Logs</h2>
      {workLogs.length === 0 ? (
        <p>No work logs yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Hours</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {workLogs.map(w => (
              <tr key={w.id}>
                <td>{w.workDate?.split('T')[0]}</td>
                <td>{w.hoursWorked}</td>
                <td>{w.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
