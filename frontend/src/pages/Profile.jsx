import { useState, useEffect } from 'react';
import { API } from '../App';

export default function Profile({ user, setUser }) {
  const [profile, setProfile] = useState(null);
  const [workLogs, setWorkLogs] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`${API}/users/${user.id}`)
      .then(r => r.json())
      .then(setProfile);

    fetch(`${API}/hours/user/${user.id}`)
      .then(r => r.json())
      .then(setWorkLogs);
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API}/upload`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      const updatedProfile = { ...profile, profilePictureUrl: data.url };
      
      await fetch(`${API}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      
      setProfile(updatedProfile);
      
      const saved = JSON.parse(localStorage.getItem('user'));
      if (saved) {
        saved.profilePictureUrl = data.url;
        localStorage.setItem('user', JSON.stringify(saved));
        if (setUser) setUser(saved);
      }
    }
    setUploading(false);
  };

  if (!profile) return <div className="py-20 text-center text-slate-500 font-medium">Loading profile...</div>;

  const totalHours = workLogs.reduce((sum, h) => sum + h.hoursWorked, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      
      {/* Profile Overview Card */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-6">My Profile</h1>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
          
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border-2 border-emerald-200 overflow-hidden relative group">
              {uploading ? (
                 <span className="text-sm font-semibold animate-pulse">Wait...</span>
              ) : profile.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold tracking-tight uppercase">
                  {profile.fullName.charAt(0)}
                </span>
              )}
              
              <label title="Upload new picture" className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span className="text-[10px] font-semibold uppercase tracking-wider">Change</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-900">{profile.fullName}</h2>
            <p className="text-slate-500 mt-1">{profile.email}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mt-6">
              {profile.phoneNumber && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                  <p className="font-medium text-slate-800">{profile.phoneNumber}</p>
                </div>
              )}
              {profile.universityId && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">University ID</p>
                  <p className="font-medium text-slate-800">{profile.universityId}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Course Status</p>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${profile.takingVolunteeringCourse ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {profile.takingVolunteeringCourse ? 'Taking Volunteering' : 'Standard Student'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-50 rounded-lg border border-emerald-100 p-6 text-center shrink-0 min-w-[150px]">
            <p className="text-sm font-semibold text-emerald-800 uppercase tracking-wider mb-1">Total Hours</p>
            <p className="text-4xl font-black text-emerald-600">
              {totalHours}
            </p>
          </div>
        </div>
      </div>

      {/* Logged Hours Table */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">Logged Hours</h2>
        
        {workLogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center">
             <p className="text-slate-500 text-lg">You haven't logged any volunteering hours yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Task</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Recorded</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hours</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {workLogs.map(w => (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {w.task?.title || `Task #${w.taskId}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {w.recordedAt?.split('T')[0]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 text-right">
                        {w.hoursWorked} <span className="text-slate-400 font-normal ml-1">hrs</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-[300px] truncate">
                        {w.notes || <span className="text-slate-400 italic">No notes provided</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
