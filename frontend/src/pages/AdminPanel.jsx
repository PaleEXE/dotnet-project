import { useState, useEffect } from 'react';
import { API } from '../App';
import { useI18n } from '../i18n/I18nContext';

export default function AdminPanel({ user }) {
  const { t } = useI18n();

  const TABS = [
    t('admin.dashboard'), t('admin.users'), t('admin.organizations'),
    t('admin.tasks'), t('admin.volunteers'), t('admin.tags')
  ];
  const TAB_KEYS = ['Dashboard', 'Users', 'Organizations', 'Tasks', 'Volunteers', 'Tags'];

  const [tabIdx, setTabIdx] = useState(0);
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
    flash(t('admin.userBlockToggled'));
  };

  const changeRole = async (id, role) => {
    await fetch(`${API}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    loadData();
    flash(`${t('admin.roleChanged')} ${role}`);
  };

  const deleteUser = async (id) => {
    if (!confirm(t('admin.confirmDeleteUser'))) return;
    await fetch(`${API}/admin/users/${id}`, { method: 'DELETE' });
    loadData();
    flash(t('admin.userDeleted'));
  };

  const deleteOrg = async (id) => {
    if (!confirm(t('admin.confirmDeleteOrg'))) return;
    await fetch(`${API}/admin/organizations/${id}`, { method: 'DELETE' });
    loadData();
    flash(t('admin.orgDeleted'));
  };

  const toggleOrgApproval = async (id) => {
    await fetch(`${API}/admin/organizations/${id}/toggle-approval`, { method: 'PUT' });
    loadData();
    flash(t('admin.orgApprovalToggled'));
  };

  const changeTaskStatus = async (id, status) => {
    await fetch(`${API}/admin/tasks/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadData();
    flash(`${t('admin.taskStatusChanged')} ${status}`);
  };

  const deleteTask = async (id) => {
    if (!confirm(t('admin.confirmDeleteTask'))) return;
    await fetch(`${API}/admin/tasks/${id}`, { method: 'DELETE' });
    loadData();
    flash(t('admin.taskDeleted'));
  };

  const changeVolunteerStatus = async (id, status) => {
    await fetch(`${API}/admin/volunteers/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadData();
    flash(`${t('admin.volunteerStatusChanged')} ${status}`);
  };

  const deleteVolunteer = async (id) => {
    await fetch(`${API}/admin/volunteers/${id}`, { method: 'DELETE' });
    loadData();
    flash(t('admin.volunteerDeleted'));
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
    flash(t('admin.tagCreated'));
  };

  const deleteTag = async (id) => {
    await fetch(`${API}/tags/${id}`, { method: 'DELETE' });
    loadData();
    flash(t('admin.tagDeleted'));
  };

  // ── Status Badge ───────────────────────────────────────
  const Badge = ({ text, color = 'slate' }) => {
    const colors = {
      sage: 'bg-sage-100 text-sage-800',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      blue: 'bg-blue-100 text-blue-800',
      slate: 'bg-slate-100 text-ink',
      purple: 'bg-purple-100 text-purple-800',
    };
    return <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full ${colors[color] || colors.slate}`}>{text}</span>;
  };

  // ── Stat Card ──────────────────────────────────────────
  const StatCard = ({ label, value, icon }) => (
    <div className="bg-white rounded-2xl border border-sand shadow-sm p-6 flex items-center gap-5 card-hover animate-fade-in">
      <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center text-xl shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-earth font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black text-ink">{value ?? '—'}</p>
      </div>
    </div>
  );

  // ── Table Shell ────────────────────────────────────────
  const Table = ({ headers, children }) => (
    <div className="bg-white rounded-2xl border border-sand shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-offwhite">
            <tr>
              {headers.map(h => (
                <th key={h} className="px-5 py-3.5 text-xs font-bold text-earth uppercase tracking-wider whitespace-nowrap">{h}</th>
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
      sage: 'bg-sage-50 text-sage-700 hover:bg-sage-100 border-sage-200',
      red: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200',
      orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200',
      blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
      slate: 'bg-offwhite text-ink hover:bg-slate-100 border-sand',
      purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
    };
    return (
      <button onClick={onClick} className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${colors[color] || colors.slate}`}>
        {children}
      </button>
    );
  };

  const tab = TAB_KEYS[tabIdx];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink tracking-tight">{t('admin.title')}</h1>
        <p className="text-earth mt-1">{t('admin.subtitle')}</p>
      </div>

      {/* Toast */}
      {msg && (
        <div className="fixed top-20 right-6 bg-sage text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold z-50 toast">
          {msg}
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-1 mb-8 bg-slate-100 p-1 rounded-2xl overflow-x-auto">
        {TABS.map((label, i) => (
          <button
            key={TAB_KEYS[i]}
            onClick={() => setTabIdx(i)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
              tabIdx === i ? 'bg-white text-sage-700 shadow-sm' : 'text-earth hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Dashboard ── */}
      {tab === 'Dashboard' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          <StatCard label={t('admin.user_count')} value={stats.user_count} icon="👤" />
          <StatCard label={t('admin.org_count')} value={stats.org_count} icon="🏢" />
          <StatCard label={t('admin.task_count')} value={stats.task_count} icon="📋" />
          <StatCard label={t('admin.volunteer_count')} value={stats.volunteer_count} icon="🤝" />
          <StatCard label={t('admin.total_hours')} value={stats.total_hours} icon="⏱️" />
          <StatCard label={t('admin.tag_count')} value={stats.tag_count} icon="🏷️" />
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'Users' && (
        <Table headers={[t('admin.id'), t('admin.name'), t('admin.email'), t('admin.role'), t('admin.univId'), t('admin.statusLabel'), t('admin.created'), t('admin.actions')]}>
          {users.map(u => (
            <tr key={u.id} className={`hover:bg-offwhite transition-colors ${u.is_blocked ? 'bg-red-50/50' : ''}`}>
              <Td className="font-mono text-slate-400">{u.id}</Td>
              <Td className="font-semibold text-ink">{u.full_name}</Td>
              <Td className="text-earth">{u.email}</Td>
              <Td><Badge text={u.role} color={u.role === 'admin' ? 'purple' : 'blue'} /></Td>
              <Td className="text-earth">{u.university_id || '—'}</Td>
              <Td>
                {u.is_blocked
                  ? <Badge text={t('admin.blocked')} color="red" />
                  : <Badge text={t('admin.active')} color="sage" />
                }
              </Td>
              <Td className="text-earth text-xs">{u.created_at?.split('T')[0]}</Td>
              <Td>
                <div className="flex gap-1.5 flex-wrap">
                  {u.id !== 1 && (
                    <>
                      <ActionBtn onClick={() => toggleBlock(u.id)} color={u.is_blocked ? 'sage' : 'orange'}>
                        {u.is_blocked ? t('admin.unblock') : t('admin.block')}
                      </ActionBtn>
                      <ActionBtn
                        onClick={() => changeRole(u.id, u.role === 'admin' ? 'student' : 'admin')}
                        color="purple"
                      >
                        {u.role === 'admin' ? t('admin.demote') : t('admin.makeAdmin')}
                      </ActionBtn>
                      <ActionBtn onClick={() => deleteUser(u.id)} color="red">{t('admin.delete')}</ActionBtn>
                    </>
                  )}
                  {u.id === 1 && <span className="text-xs text-slate-400 italic">{t('admin.primaryAdmin')}</span>}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {/* ── Organizations ── */}
      {tab === 'Organizations' && (
        <Table headers={[t('admin.id'), t('admin.name'), t('admin.email'), t('admin.phone'), t('admin.statusLabel'), t('admin.created'), t('admin.actions')]}>
          {orgs.map(o => (
            <tr key={o.id} className="hover:bg-offwhite transition-colors">
              <Td className="font-mono text-slate-400">{o.id}</Td>
              <Td className="font-semibold text-ink">{o.name}</Td>
              <Td className="text-earth">{o.email}</Td>
              <Td className="text-earth">{o.phone_number || '—'}</Td>
              <Td>
                {o.is_approved
                  ? <Badge text={t('admin.approved')} color="sage" />
                  : <Badge text={t('admin.pending')} color="orange" />
                }
              </Td>
              <Td className="text-earth text-xs">{o.created_at?.split('T')[0]}</Td>
              <Td>
                <div className="flex gap-1.5 flex-wrap">
                  <ActionBtn onClick={() => toggleOrgApproval(o.id)} color={o.is_approved ? 'orange' : 'sage'}>
                    {o.is_approved ? t('admin.revoke') : t('admin.approve')}
                  </ActionBtn>
                  <ActionBtn onClick={() => deleteOrg(o.id)} color="red">{t('admin.delete')}</ActionBtn>
                </div>
              </Td>
            </tr>
          ))}
          {orgs.length === 0 && (
            <tr><Td className="text-slate-400 italic py-8 text-center" colSpan={7}>{t('admin.noOrganizations')}</Td></tr>
          )}
        </Table>
      )}

      {/* ── Tasks ── */}
      {tab === 'Tasks' && (
        <Table headers={[t('admin.id'), t('admin.titleCol'), t('admin.organization'), t('admin.statusLabel'), t('admin.maxVol'), t('admin.dates'), t('admin.actions')]}>
          {tasks.map(task => (
            <tr key={task.id} className="hover:bg-offwhite transition-colors">
              <Td className="font-mono text-slate-400">{task.id}</Td>
              <Td className="font-semibold text-ink max-w-[200px] truncate">{task.title}</Td>
              <Td className="text-earth">{task.organization?.name || '—'}</Td>
              <Td>
                <Badge
                  text={task.status}
                  color={task.status === 'open' ? 'sage' : task.status === 'closed' ? 'red' : 'blue'}
                />
              </Td>
              <Td className="text-earth">{task.max_volunteers ?? '∞'}</Td>
              <Td className="text-earth text-xs">
                {task.start_date ? task.start_date.split('T')[0] : '—'} → {task.end_date ? task.end_date.split('T')[0] : '—'}
              </Td>
              <Td>
                <div className="flex gap-1.5 flex-wrap">
                  <select
                    className="px-2 py-1 text-xs rounded border border-sand bg-white text-ink focus:ring-sage-500 focus:border-sage-500"
                    value={task.status}
                    onChange={e => changeTaskStatus(task.id, e.target.value)}
                  >
                    <option value="open">{t('admin.open')}</option>
                    <option value="closed">{t('admin.closed')}</option>
                    <option value="done">{t('admin.done')}</option>
                  </select>
                  <ActionBtn onClick={() => deleteTask(task.id)} color="red">{t('admin.delete')}</ActionBtn>
                </div>
              </Td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr><Td className="text-slate-400 italic py-8 text-center" colSpan={7}>{t('admin.noTasks')}</Td></tr>
          )}
        </Table>
      )}

      {/* ── Volunteers ── */}
      {tab === 'Volunteers' && (
        <Table headers={[t('admin.id'), t('admin.user'), t('admin.task'), t('admin.statusLabel'), t('admin.joinedCol'), t('admin.actions')]}>
          {volunteers.map(v => (
            <tr key={v.id} className="hover:bg-offwhite transition-colors">
              <Td className="font-mono text-slate-400">{v.id}</Td>
              <Td className="font-semibold text-ink">{v.user?.full_name || `User #${v.user_id}`}</Td>
              <Td className="text-earth">{v.task?.title || `Task #${v.task_id}`}</Td>
              <Td>
                <Badge
                  text={v.status}
                  color={v.status === 'approved' ? 'sage' : v.status === 'rejected' ? 'red' : 'orange'}
                />
              </Td>
              <Td className="text-earth text-xs">{v.joined_at?.split('T')[0]}</Td>
              <Td>
                <div className="flex gap-1.5 flex-wrap">
                  <select
                    className="px-2 py-1 text-xs rounded border border-sand bg-white text-ink focus:ring-sage-500 focus:border-sage-500"
                    value={v.status}
                    onChange={e => changeVolunteerStatus(v.id, e.target.value)}
                  >
                    <option value="pending">{t('admin.pending')}</option>
                    <option value="approved">{t('admin.approved')}</option>
                    <option value="rejected">{t('admin.rejected')}</option>
                  </select>
                  <ActionBtn onClick={() => deleteVolunteer(v.id)} color="red">{t('admin.delete')}</ActionBtn>
                </div>
              </Td>
            </tr>
          ))}
          {volunteers.length === 0 && (
            <tr><Td className="text-slate-400 italic py-8 text-center" colSpan={6}>{t('admin.noVolunteers')}</Td></tr>
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
              placeholder={t('admin.newTagPlaceholder')}
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-sand focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none text-sm text-ink"
            />
            <button
              onClick={addTag}
              className="px-5 py-2.5 bg-sage hover:bg-sage-hover text-white font-semibold rounded-2xl transition-colors text-sm"
            >
              {t('admin.addTag')}
            </button>
          </div>

          <Table headers={[t('admin.id'), t('admin.name'), t('admin.actions')]}>
            {tags.map(tag => (
              <tr key={tag.id} className="hover:bg-offwhite transition-colors">
                <Td className="font-mono text-slate-400">{tag.id}</Td>
                <Td className="font-semibold text-ink">{tag.name}</Td>
                <Td>
                  <ActionBtn onClick={() => deleteTag(tag.id)} color="red">{t('admin.delete')}</ActionBtn>
                </Td>
              </tr>
            ))}
            {tags.length === 0 && (
              <tr><Td className="text-slate-400 italic py-8 text-center" colSpan={3}>{t('admin.noTags')}</Td></tr>
            )}
          </Table>
        </div>
      )}
    </div>
  );
}
