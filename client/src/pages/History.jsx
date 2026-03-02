import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import Navbar from '../components/Navbar';
import EditModal from '../components/EditModal';

const CATEGORY_META = {
  Food: { emoji: '🍔', color: '#f87171' },
  Travel: { emoji: '✈️', color: '#60a5fa' },
  Groceries: { emoji: '🛒', color: '#34d399' },
  Utilities: { emoji: '💡', color: '#fbbf24' },
  Health: { emoji: '💊', color: '#a78bfa' },
  Shopping: { emoji: '🛍️', color: '#f472b6' },
  Other: { emoji: '📦', color: '#9ca3af' },
};

function getCatMeta(cat) {
  return CATEGORY_META[cat] || { emoji: '💰', color: '#6c63ff' };
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function History() {
  const [expenses, setExpenses] = useState([]);
  const [query, setQuery] = useState('');
  const [editExp, setEditExp] = useState(null);
  const [delId, setDelId] = useState(null);  // for inline confirm
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('userId')) { navigate('/'); return; }
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const resp = await API.get('/expenses');
      setExpenses(resp.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    try {
      await API.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch { /* ignore */ }
    setDelId(null);
  };

  const handleSaved = updated => {
    setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const filtered = expenses.filter(e => {
    const q = query.toLowerCase();
    return (
      e.category.toLowerCase().includes(q) ||
      (e.notes || '').toLowerCase().includes(q) ||
      String(e.amount).includes(q)
    );
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />

      <div className="page">
        {/* Header */}
        <div style={{ marginBottom: 24, animation: 'fadeSlideUp 0.35s var(--ease) both' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Expense History</h1>
          <p style={{ marginTop: 4, fontSize: 14 }}>All your recorded expenses</p>
        </div>

        <div className="history-card" style={{ animation: 'fadeSlideUp 0.4s var(--ease) both' }}>
          {/* Toolbar */}
          <div className="history-toolbar">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by category, notes, amount…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <Link to="/add" className="btn btn-primary" style={{ textDecoration: 'none', padding: '8px 18px', fontSize: 13 }}>
              + Add New
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">{query ? '🔍' : '🧾'}</div>
              <h3>{query ? 'No results found' : 'No expenses yet'}</h3>
              <p>{query ? 'Try a different search term' : 'Add your first expense to get started'}</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="expenses-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(e => {
                      const { emoji, color } = getCatMeta(e.category);
                      const isDeleting = delId === e.id;
                      return (
                        <tr key={e.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                width: 30, height: 30, background: 'var(--bg-elevated)',
                                borderRadius: 6, display: 'inline-flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: 15, flexShrink: 0,
                              }}>
                                {emoji}
                              </span>
                              <span style={{ fontWeight: 600, color, fontSize: 13 }}>{e.category}</span>
                            </div>
                          </td>
                          <td className="amount-cell">₹{e.amount.toLocaleString('en-IN')}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(e.date)}</td>
                          <td className="notes-cell" title={e.notes}>{e.notes || '—'}</td>
                          <td>
                            {isDeleting ? (
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: 'var(--danger)' }}>Delete?</span>
                                <button className="btn btn-danger btn-icon" style={{ fontSize: 12, width: 'auto', padding: '3px 8px', height: 'auto' }} onClick={() => handleDelete(e.id)}>Yes</button>
                                <button className="btn btn-ghost btn-icon" style={{ fontSize: 12, width: 'auto', padding: '3px 8px', height: 'auto' }} onClick={() => setDelId(null)}>No</button>
                              </div>
                            ) : (
                              <div className="actions-cell">
                                <button
                                  className="btn btn-ghost btn-icon"
                                  title="Edit"
                                  onClick={() => setEditExp(e)}
                                >✏️</button>
                                <button
                                  className="btn btn-danger btn-icon"
                                  title="Delete"
                                  onClick={() => setDelId(e.id)}
                                >🗑️</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
                paddingTop: 12,
                borderTop: '1px solid var(--border)',
                fontSize: 13,
                color: 'var(--text-muted)',
              }}>
                <span>{filtered.length} expense{filtered.length !== 1 ? 's' : ''}</span>
                <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: 15 }}>
                  Total: ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editExp && (
        <EditModal
          expense={editExp}
          onClose={() => setEditExp(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
