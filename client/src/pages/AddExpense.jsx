import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function AddExpense() {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      navigate('/');
    }
    setDate(new Date().toISOString().slice(0, 10));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await API.post('/expenses', { amount, category, date, notes });
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to add');
    }
  };

  const categories = ['Food', 'Travel', 'Groceries', 'Utilities', 'Other'];

  return (
    <div style={{ padding: '20px' }}>
      <nav>
        <Link to="/dashboard">Dashboard</Link> |{' '}
        <a
          href="#"
          onClick={() => {
            localStorage.removeItem('userId');
            navigate('/');
          }}
        >
          Logout
        </a>
      </nav>
      <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center' }}>Add Expense</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Amount</label>
            <input
              className="input-underline"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Category</label>
            <select
              className="input-underline"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>
                -- select --
              </option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Date</label>
            <input
              className="input-underline"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Notes</label>
            <textarea
              className="input-underline"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <button type="submit" style={{ width: '100%' }}>
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
