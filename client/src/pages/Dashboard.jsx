
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import StatsCard from '../components/StatsCard';
import ExpenseChart from '../components/ExpenseChart';

export default function Dashboard() {
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

  const total = expenses.reduce((acc, e) => acc + e.amount, 0);
  const income = 0; // not implemented separately
  const balance = total; // simple

  return (
    <div style={{ padding: '20px' }}>
      <nav>
        <Link to="/add">Add</Link> |{' '}
        <Link to="/history">History</Link> |{' '}
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
      <h2>Dashboard</h2>
      <div className="dashboard-header card">
        <h3>Total Spent</h3>
        <p>₹{total}</p>
      </div>
      <div className="stats-grid">
        <div className="stats-card income">
          <StatsCard title="Income" value={income} />
        </div>
        <div className="stats-card expense">
          <StatsCard title="Expense" value={total} />
        </div>
        <div className="stats-card balance">
          <StatsCard title="Balance" value={balance} />
        </div>
        <div className="stats-card budget">
          <StatsCard title="Budget" value={0} />
        </div>
      </div>
      <ExpenseChart expenses={expenses} />
      <Link
        to="/add"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          background: '#0077cc',
          color: '#fff',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          textDecoration: 'none',
        }}
      >
        +
      </Link>
    </div>
  );
}
