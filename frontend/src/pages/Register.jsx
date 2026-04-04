import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../App';

export default function Register({ onLogin }) {
  const [role, setRole] = useState('student');
  
  // User fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [takingVolunteeringCourse, setTakingVolunteeringCourse] = useState(false);
  
  // Org fields
  const [orgName, setOrgName] = useState('');
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let endpoint = `${API}/auth/register`;
    let body = {};

    if (role === 'organization') {
      endpoint = `${API}/auth/register/org`;
      body = { email, password, name: orgName, phoneNumber };
    } else {
      body = { email, password, fullName, phoneNumber, role, universityId, takingVolunteeringCourse };
    }

    const res = await fetch(endpoint, {
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
    <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-slate-100 p-8 my-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Create an Account</h1>
        <p className="text-slate-500 text-sm">Join Fursa today</p>
      </div>

      {error && (
         <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
           <p className="text-sm text-red-700 font-medium">{error}</p>
         </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Role Selector toggles */}
        <div className="flex p-1 bg-slate-100 rounded-lg">
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${role === 'student' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setRole('student')}
          >
            Student Volunteer
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${role === 'organization' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setRole('organization')}
          >
            Organization
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
            <input 
              type="text" 
              value={phoneNumber} 
              onChange={e => setPhoneNumber(e.target.value)} 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700"
            />
          </div>

          {role === 'student' && (
            <>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input 
                  type="text"
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  required 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">University ID</label>
                <input 
                  type="text"
                  value={universityId} 
                  onChange={e => setUniversityId(e.target.value)} 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700"
                />
              </div>

              <div className="flex items-center pt-8">
                <input 
                  type="checkbox" 
                  id="vc" 
                  checked={takingVolunteeringCourse} 
                  onChange={e => setTakingVolunteeringCourse(e.target.checked)} 
                  className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="vc" className="ml-2 block text-sm font-medium text-slate-700 cursor-pointer">
                  Taking volunteering course
                </label>
              </div>
            </>
          )}

          {role === 'organization' && (
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Organization Name</label>
              <input 
                type="text"
                value={orgName} 
                onChange={e => setOrgName(e.target.value)} 
                required 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700"
              />
            </div>
          )}

        </div>

        <button 
          type="submit" 
          className="w-full py-3 px-4 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          Create Account
        </button>
      </form>

      <div className="mt-8 text-center border-t border-slate-100 pt-6">
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
