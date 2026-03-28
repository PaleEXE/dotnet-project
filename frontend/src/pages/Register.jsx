import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../App';

export default function Register({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [volunteeringCourse, setVolunteeringCourse] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const body = { email, password, role };
    if (role === 'student') {
      body.fullName = fullName;
      body.studentNumber = studentNumber;
      body.volunteeringCourse = volunteeringCourse;
    } else {
      body.orgName = orgName;
      body.orgDescription = orgDescription;
      body.contactPhone = contactPhone;
    }

    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || 'Registration failed');
      return;
    }

    // Auto-login after registration
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginRes.json();
    if (loginRes.ok) {
      onLogin(loginData.user, loginData.token);
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: 500 }}>
      <h1>Register</h1>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="organization">Organization</option>
          </select>
        </div>

        {role === 'student' && (
          <>
            <div className="form-group">
              <label>Full Name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Student Number</label>
              <input value={studentNumber} onChange={e => setStudentNumber(e.target.value)} />
            </div>
            <div className="checkbox-group">
              <input type="checkbox" id="vc" checked={volunteeringCourse} onChange={e => setVolunteeringCourse(e.target.checked)} />
              <label htmlFor="vc">Taking volunteering course?</label>
            </div>
          </>
        )}

        {role === 'organization' && (
          <>
            <div className="form-group">
              <label>Organization Name</label>
              <input value={orgName} onChange={e => setOrgName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={orgDescription} onChange={e => setOrgDescription(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
      </form>
      <p style={{ marginTop: 16, textAlign: 'center' }}>
        Already have an account? <Link to="/login" className="link">Login</Link>
      </p>
    </div>
  );
}
