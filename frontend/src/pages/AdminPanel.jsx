import { useState, useEffect } from 'react';
import { API } from '../App';

const TABS = ['Dashboard', 'Users', 'Organizations', 'Tasks', 'Volunteers', 'Tags'];

export default function AdminPanel({ user }) {
  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    fetch(`${API}/admin/stats`).then(r => r.json()).then(setStats);
    fetch(`${API}/users`).then(r => r.json()).then(setUsers);
    fetch(`${API}/organizations`).then(r => r.json()).then(setOrgs);
    fetch(`${API}/tasks`).then(r => r.json()).then(setTasks);
    fetch(`${API}/volunteers`).then(r => r.json()).then(setVolunteers);
    fetch(`${API}/tags`).then(r => r.json()).then(setTags);
  };

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  // ── Admin Actions ──────────────────────────────────────
  const toggleBlock = async (id) => {
    await fetch(`${API}/admin/users/${id}/block`, { method: 'PUT' });
    loadData();
    flash('User block status toggled');
  };

  const changeRole = async (id, role) => {
    await fetch(`${API}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    loadData();
    flash(`User role changed to ${role}`);
  };

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await fetch(`${API}/admin/users/${id}`, { method: 'DELETE' });
    loadData();
    flash('User deleted');
  };

  const deleteOrg = async (id) => {
    if (!confirm('Delete this organization and all its tasks?')) return;
    await fetch(`${API}/admin/organizations/${id}`, { method: 'DELETE' });
    loadData();
    flash('Organization deleted');
  };

  const changeTaskStatus = async (id, status) => {
    await fetch(`${API}/admin/tasks/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadData();
    flash(`Task status changed to ${status}`);
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    await fetch(`${API}/admin/tasks/${id}`, { method: 'DELETE' });
    loadData();
    flash('Task deleted');
  };

  const changeVolunteerStatus = async (id, status) => {
    await fetch(`${API}/admin/volunteers/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadData();
    flash(`Volunteer status changed to ${status}`);
  };

  const deleteVolunteer = async (id) => {
    await fetch(`${API}/admin/volunteers/${id}`, { method: 'DELETE' });
    loadData();
    flash('Volunteer record removed');
  };

  const addTag = async () => {
    if (!newTag.trim()) return;
    await fetch(`${API}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTag.trim() })
    });
    setNewTag('');
    loadData();
    flash('Tag created');
  };

  const deleteTag = async (id) => {
    await fetch(`${API}/tags/${id}`, { method: 'DELETE' });
    loadData();
    flash('Tag deleted');
  };

  // ── Status Badge ───────────────────────────────────────
  const Badge = ({ text, color = 'slate' }) => {
    const colors = {
      emerald: 'bg-emerald-100 text-emerald-800',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      blue: 'bg-blue-100 text-blue-800',
      slate: 'bg-slate-100 text-slate-700',
      purple: 'bg-purple-100 text-purple-800',
    };
    return <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full ${colors[color] || colors.slate}`}>{text}</span>;
  };

  // ── Stat Card ──────────────────────────────────────────
  const StatCard = ({ label, value, icon }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-5">
      <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black text-slate-900">{value ?? '—'}</p>
      </div>
    </div>
  );

  // ── Table Shell ────────────────────────────────────────
  const Table = ({ headers, children }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {headers.map(h => (
                <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    </div>
  );

  const Td = ({ children, className = '' }) => <td className={`px-5 py-3.5 whitespace-nowrap ${className}`}>{children}</td>;

  const ActionBtn = ({ onClick, color = 'slate', children }) => {
    const colors = {
      emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
      red: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200',
      orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200',
      blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
      slate: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200',
      purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
    };
    return (
      <button onClick={onClick} className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${colors[color] || colors.slate}`}>
        {children}
      </button>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Panel</h1>
        <p className="text-slate-500 mt-1">Manage all system data</p>
      </div>

      {/* Toast */}
      {msg && (
        <div className="fixed top-20 right-6 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-semibold z-50 animate-pulse">
          {msg}
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-1 mb-8 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              tab === t ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Dashboard ── */}
      {tab === 'Dashboard' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="Users" value={stats.userCount} icon="👤" />
          <StatCard label="Organizations" value={stats.orgCount} icon="🏢" />
          <StatCard label="Tasks" value={stats.taskCount} icon="📋" />
          <StatCard label="Volunteers" value={stats.volunteerCount} icon="🤝" />
          <StatCard label="Total Hours" value={stats.totalHours} icon="⏱️" />
          <StatCard label="Tags" value={stats.tagCount} icon="🏷️" />
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'Users' && (
        <Table headers={['ID', 'Name', 'Email', 'Role', 'Univ ID', 'Status', 'Created', 'Actions']}>
          {users.map(u => (
            <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${u.isBlocked ? 'bg-red-50/50' : ''}`}>
              <Td className="font-mono text-slate-400">{u.id}</Td>
              <Td className="font-semibold text-slate-800">{u.fullName}</Td>
              <Td className="text-slate-600">{u.email}</Td>
              <Td><Badge text={u.role} color={u.role === 'admin' ? 'purple' : 'blue'} /></Td>
              <Td className="text-slate-500">{u.universityId || '—'}</Td>
              <Td>
                {u.isBlocked
                  ? <Badge text="Blocked" color="red" />
                  : <Badge text="Active" color="emerald" />
                }
              </Td>
              <Td className="text-slate-500 text-xs">{u.createdAt?.split('T')[0]}</Td>
              <Td>
                <div className="flex gap-1.5 flex-wrap">
                  {u.id !== 1 && (
                    <>
                      <ActionBtn onClick={() => toggleBlock(u.id)} color={u.isBlocked ? 'emerald' : 'orange'}>
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </ActionBtn>
                      <ActionBtn
                        onClick={() => changeRole(u.id, u.role === 'admin' ? 'student' : 'admin')}
                        color="purple"
                      >
                        {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                      </ActionBtn>
                      <ActionBtn onClick={() => deleteUser(u.id)} color="red">Delete</ActionBtn>
                    </>
                  )}
                  {u.id === 1 && <span className="text-xs text-slate-400 italic">Primary admin</span>}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {/* ── Organizations ── */}
      {tab === 'Organizations' && (
        <Table headers={['ID', 'Name', 'Email', 'Phone', 'Created', 'Actions']}>
          {orgs.map(o => (
            <tr key={o.id} className="hover:bg-slate-50 transition-colors">
              <Td className="font-mono text-slate-400">{o.id}</Td>
              <Td className="font-semibold text-slate-800">{o.name}</Td>
              <Td className="text-slate-600">{o.email}</Td>
              <Td className="text-slate-500">{o.phoneNumber || '—'}</Td>
              <Td className="text-slate-500 text-xs">{o.createdAt?.split('T')[0]}</Td>
              <Td>
                <ActionBtn onClick={() => deleteOrg(o.id)} color="red">Delete</ActionBtn>
              </Td>
            </tr>
          ))}
          {orgs.length === 0 && (
            <tr><Td className="text-slate-400 italic py-8 text-center" colSpan={6}>No organizations</Td></tr>
          )}
        </Table>
      )}

      {/* ── Tasks ── */}
      {tab === 'Tasks' && (
        <Table headers={['ID', 'Title', 'Organization', 'Status', 'Max Vol.', 'Dates', 'Actions']}>
          {tasks.map(t => (
            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
              <Td className="font-mono text-slate-400">{t.id}</Td>
              <Td className="font-semibold text-slate-800 max-w-[200px] truncate">{t.title}</Td>
              <Td className="text-slate-600">{t.organization?.name || '—'}</Td>
              <Td>
                <Badge
                  text={t.status}
                  color={t.status === 'open' ? 'emerald' : t.status === 'closed' ? 'red' : 'blue'}
                />
              </Td>
              <Td className="text-slate-500">{t.maxVolunteers ?? '∞'}</Td>
              <Td className="text-slate-500 text-xs">
                {t.startDate ? t.startDate.split('T')[0] : '—'} → {t.endDate ? t.endDate.split('T')[0] : '—'}
              </Td>
              <Td>
                <div className="flex gap-1.5 flex-wrap">
                  <select
                    className="px-2 py-1 text-xs rounded border border-slate-200 bg-white text-slate-700 focus:ring-emerald-500 focus:border-emerald-500"
                    value={t.status}
                    onChange={e => changeTaskStatus(t.id, e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="done">Done</option>
                  </select>
                  <ActionBtn onClick={() => deleteTask(t.id)} color="red">Delete</ActionBtn>
                </div>
              </Td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr><Td className="text-slate-400 italic py-8 text-center" colSpan={7}>No tasks</Td></tr>
          )}
        </Table>
      )}

      {/* ── Volunteers ── */}
      {tab === 'Volunteers' && (
        <Table headers={['ID', 'User', 'Task', 'Status', 'Joined', 'Actions']}>
          {volunteers.map(v => (
            <tr key={v.id} className="hover:bg-slate-50 transition-colors">
              <Td className="font-mono text-slate-400">{v.id}</Td>
              <Td className="font-semibold text-slate-800">{v.user?.fullName || `User #${v.userId}`}</Td>
              <Td className="text-slate-600">{v.task?.title || `Task #${v.taskId}`}</Td>
              <Td>
                <Badge
                  text={v.status}
                  color={v.status === 'approved' ? 'emerald' : v.status === 'rejected' ? 'red' : 'orange'}
                />
              </Td>
              <Td className="text-slate-500 text-xs">{v.joinedAt?.split('T')[0]}</Td>
              <Td>
                <div className="flex gap-1.5 flex-wrap">
                  <select
                    className="px-2 py-1 text-xs rounded border border-slate-200 bg-white text-slate-700 focus:ring-emerald-500 focus:border-emerald-500"
                    value={v.status}
                    onChange={e => changeVolunteerStatus(v.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <ActionBtn onClick={() => deleteVolunteer(v.id)} color="red">Delete</ActionBtn>
                </div>
              </Td>
            </tr>
          ))}
          {volunteers.length === 0 && (
            <tr><Td className="text-slate-400 italic py-8 text-center" colSpan={6}>No volunteer records</Td></tr>
          )}
        </Table>
      )}

      {/* ── Tags ── */}
      {tab === 'Tags' && (
        <div className="space-y-6">
          {/* Add Tag */}
          <div className="flex gap-3 max-w-md">
            <input
              type="text"
              placeholder="New tag name"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-slate-800"
            />
            <button
              onClick={addTag}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Add Tag
            </button>
          </div>

          <Table headers={['ID', 'Name', 'Actions']}>
            {tags.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <Td className="font-mono text-slate-400">{t.id}</Td>
                <Td className="font-semibold text-slate-800">{t.name}</Td>
                <Td>
                  <ActionBtn onClick={() => deleteTag(t.id)} color="red">Delete</ActionBtn>
                </Td>
              </tr>
            ))}
            {tags.length === 0 && (
              <tr><Td className="text-slate-400 italic py-8 text-center" colSpan={3}>No tags yet</Td></tr>
            )}
          </Table>
        </div>
      )}
    </div>
  );
}
