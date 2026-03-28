import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../App';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || 'Login failed');
      return;
    }

    onLogin(data.user, data.token);
    navigate('/');
  };

  return (
    <div className="auth-container">
      <h1>Volunteer Login</h1>
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
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
      </form>
      <p style={{ marginTop: 16, textAlign: 'center' }}>
        Don't have an account? <Link to="/register" className="link">Register</Link>
      </p>
    </div>
  );
}
