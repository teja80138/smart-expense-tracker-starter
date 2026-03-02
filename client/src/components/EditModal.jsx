import { useState, useEffect } from 'react';
import API from '../api';

const CATEGORIES = [
    { value: 'Food', emoji: '🍔', color: '#f87171' },
    { value: 'Travel', emoji: '✈️', color: '#60a5fa' },
    { value: 'Groceries', emoji: '🛒', color: '#34d399' },
    { value: 'Utilities', emoji: '💡', color: '#fbbf24' },
    { value: 'Health', emoji: '💊', color: '#a78bfa' },
    { value: 'Shopping', emoji: '🛍️', color: '#f472b6' },
    { value: 'Other', emoji: '📦', color: '#9ca3af' },
];

export default function EditModal({ expense, onClose, onSaved }) {
    const [amount, setAmount] = useState(String(expense.amount));
    const [category, setCategory] = useState(expense.category);
    const [date, setDate] = useState(expense.date);
    const [notes, setNotes] = useState(expense.notes || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Trap focus
    useEffect(() => {
        const onKey = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        const n = parseFloat(amount);
        if (!n || n <= 0) { setError('Enter a valid positive amount'); return; }
        setLoading(true);
        try {
            const resp = await API.put(`/expenses/${expense.id}`, { amount: n, category, date, notes });
            onSaved(resp.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box">
                <div className="modal-header">
                    <h2>Edit Expense</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

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
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                required
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
                        <label>Notes <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Any details…"
                            style={{ resize: 'none' }}
                        />
                    </div>

                    {error && (
                        <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>
                    )}

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
