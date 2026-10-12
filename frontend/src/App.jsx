import { useCallback, useEffect, useState } from 'react';

const EMPTY_FORM = { name: '', email: '', age: '' };

async function apiRequest(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  const payload = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Something went wrong');
  return payload;
}

export default function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/users');
      setUsers(data.users || []);
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  function updateField(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice({ type: '', text: '' });

    const name = form.name.trim();
    const email = form.email.trim();
    const age = Number(form.age);
    if (!name || !email || form.age === '') {
      setNotice({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNotice({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      setNotice({ type: 'error', text: 'Age must be a whole number between 1 and 120.' });
      return;
    }

    try {
      setSaving(true);
      const payload = { name, email, age };
      const result = editingId
        ? await apiRequest(`/users/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await apiRequest('/users', { method: 'POST', body: JSON.stringify(payload) });
      setNotice({ type: 'success', text: result.message || 'Saved successfully.' });
      resetForm();
      await loadUsers();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(id) {
    setNotice({ type: '', text: '' });
    try {
      const { user } = await apiRequest(`/users/${id}`);
      setForm({ name: user.name, email: user.email, age: String(user.age) });
      setEditingId(user._id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    setNotice({ type: '', text: '' });
    try {
      const result = await apiRequest(`/users/${user._id}`, { method: 'DELETE' });
      setNotice({ type: 'success', text: result.message || 'User deleted.' });
      if (editingId === user._id) resetForm();
      await loadUsers();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="brand-mark">UM</div>
        <div>
          <p className="eyebrow">ADMIN WORKSPACE</p>
          <h1>User Management</h1>
          <p className="subtitle">Create, update, and manage your user directory.</p>
        </div>
      </header>

      {notice.text && (
        <div className={`notice ${notice.type}`} role="status">
          <span>{notice.text}</span>
          <button className="notice-close" onClick={() => setNotice({ type: '', text: '' })} aria-label="Dismiss message">×</button>
        </div>
      )}

      <section className="panel form-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{editingId ? 'UPDATE RECORD' : 'NEW RECORD'}</p>
            <h2>{editingId ? 'Edit user' : 'Add a user'}</h2>
          </div>
          {editingId && <button className="button button-light" type="button" onClick={resetForm}>Cancel edit</button>}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              <span>Full name <b>*</b></span>
              <input name="name" value={form.name} onChange={updateField} placeholder="e.g. Rakesh Kumar" required minLength="2" maxLength="80" />
            </label>
            <label>
              <span>Email address <b>*</b></span>
              <input name="email" type="email" value={form.email} onChange={updateField} placeholder="name@example.com" required />
            </label>
            <label>
              <span>Age <b>*</b></span>
              <input name="age" type="number" value={form.age} onChange={updateField} placeholder="e.g. 24" min="1" max="120" step="1" required />
            </label>
          </div>
          <div className="form-footer">
            <p className="helper-text"><b>*</b> All fields are required.</p>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : '＋ Add user'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel table-panel">
        <div className="section-heading list-heading">
          <div>
            <p className="eyebrow">DIRECTORY</p>
            <h2>All users <span className="count">{users.length}</span></h2>
          </div>
          <button className="button button-light" onClick={loadUsers} disabled={loading}>↻ Refresh</button>
        </div>
        {loading ? <div className="empty-state">Loading users…</div> : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <h3>No users yet</h3>
            <p>Add your first user using the form above.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Email</th><th>Age</th><th className="actions-heading">Actions</th></tr></thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td><div className="user-cell"><div className="avatar">{user.name.trim().charAt(0).toUpperCase()}</div><span>{user.name}</span></div></td>
                    <td className="email-cell">{user.email}</td>
                    <td><span className="age-pill">{user.age}</span></td>
                    <td><div className="actions">
                      <button className="button button-edit" onClick={() => handleEdit(user._id)}>Edit</button>
                      <button className="button button-delete" onClick={() => handleDelete(user)}>Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footnote">Showing {users.length} {users.length === 1 ? 'record' : 'records'}</div>
      </section>
      <footer>USER MANAGEMENT <span>•</span> CRUD DEMO</footer>
    </main>
  );
}
