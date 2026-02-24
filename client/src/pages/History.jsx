import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function History() {
  const [expenses, setExpenses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      navigate('/');
      return;
    }
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const resp = await API.get('/expenses');
    setExpenses(resp.data);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete?')) return;
    await API.delete(`/expenses/${id}`);
    loadExpenses();
  };

  const handleEdit = async exp => {
    const amount = prompt('Amount', exp.amount);
    if (amount === null) return;
    const category = prompt('Category', exp.category);
    if (category === null) return;
    const date = prompt('Date', exp.date);
    if (date === null) return;
    const notes = prompt('Notes', exp.notes);
    if (notes === null) return;
    await API.put(`/expenses/${exp.id}`, {
      amount,
      category,
      date,
      notes,
    });
    loadExpenses();
  };

  return (
    <div style={{ padding: '20px' }}>
      <nav>
        <Link to="/dashboard">Dashboard</Link> |{' '}
        <Link to="/add">Add Expense</Link> |{' '}
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
      <div className="card">
        <h2>Expense History</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th>Notes</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id}>
                <td>{e.amount}</td>
                <td>{e.category}</td>
                <td>{e.date}</td>
                <td>{e.notes}</td>
                <td>
                  <button onClick={() => handleEdit(e)}>✏️</button>{' '}
                  <button onClick={() => handleDelete(e.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
