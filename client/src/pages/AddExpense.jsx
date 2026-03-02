import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Navbar from '../components/Navbar';

const CATEGORIES = [
  { value: 'Food', emoji: '🍔' },
  { value: 'Travel', emoji: '✈️' },
  { value: 'Groceries', emoji: '🛒' },
  { value: 'Utilities', emoji: '💡' },
  { value: 'Health', emoji: '💊' },
  { value: 'Shopping', emoji: '🛍️' },
  { value: 'Other', emoji: '📦' },
];

export default function AddExpense() {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('userId')) { navigate('/'); return; }
    setDate(new Date().toISOString().slice(0, 10));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!category) { setError('Please select a category'); return; }
    const n = parseFloat(amount);
    if (!n || n <= 0) { setError('Enter a valid positive amount'); return; }
    setLoading(true);
    try {
      await API.post('/expenses', { amount: n, category, date, notes });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div className="page-narrow">
        <div className="add-page-header">
          <h1>Add Expense</h1>
          <p style={{ marginTop: 4, fontSize: 14 }}>Record a new spending entry</p>
        </div>

        <div className="add-card">
          <form onSubmit={handleSubmit}>
            {/* Amount */}
            <div className="field">
              <label>Amount</label>
              <div className="amount-input-wrap">
                <span className="amount-prefix">₹</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Category */}
            <div className="field">
              <label>Category</label>
              <div className="category-grid">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    className={`category-pill${category === cat.value ? ' selected' : ''}`}
                    onClick={() => setCategory(cat.value)}
                  >
                    <span className="category-pill-emoji">{cat.emoji}</span>
                    {cat.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="field">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            {/* Notes */}
            <div className="field">
              <label>Notes <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="What was this for?"
                style={{ resize: 'none' }}
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--danger-bg)',
                border: '1px solid rgba(248,113,113,0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: 13,
                color: 'var(--danger)',
              }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 2 }}
                disabled={loading}
              >
                {loading
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff4', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Saving…
                  </span>
                  : '+ Add Expense'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
