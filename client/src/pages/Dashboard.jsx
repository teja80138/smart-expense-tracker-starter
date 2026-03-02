import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import ExpenseChart from '../components/ExpenseChart';

const CATEGORY_META = {
  Food: { emoji: '🍔' },
  Travel: { emoji: '✈️' },
  Groceries: { emoji: '🛒' },
  Utilities: { emoji: '💡' },
  Health: { emoji: '💊' },
  Shopping: { emoji: '🛍️' },
  Other: { emoji: '📦' },
};

function getCategoryEmoji(cat) {
  return CATEGORY_META[cat]?.emoji || '💰';
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [budget, setBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const email = localStorage.getItem('userEmail') || 'there';
  const firstName = email.split('@')[0];

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) { navigate('/'); return; }
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [expRes, sumRes, budRes] = await Promise.all([
        API.get('/expenses'),
        API.get('/summary'),
        API.get('/budget'),
      ]);
      setExpenses(expRes.data);
      setSummary(sumRes.data);
      setBudget(budRes.data.amount);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const total = summary?.total || 0;
  const count = summary?.count || 0;
  const thisMonth = summary?.thisMonthTotal || 0;
  const avg = count > 0 ? Math.round(total / count) : 0;
  const recentFive = expenses.slice(0, 5);

  const budgetPct = budget > 0 ? Math.min((thisMonth / budget) * 100, 100) : 0;
  const budgetOver = budget > 0 && thisMonth > budget;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />

      <div className="page">
        {/* Welcome */}
        <div className="dashboard-welcome">
          <h1>{greet()}, {firstName} 👋</h1>
          <p style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: 14 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatsCard title="Total Spent" value={total} icon="💸" color="#f87171" delay={0} />
          <StatsCard title="This Month" value={thisMonth} icon="📅" color="#6c63ff" delay={80} />
          <StatsCard title="Avg / Expense" value={avg} icon="📊" color="#22d3a0" delay={160} />
          <StatsCard title="# Transactions" value={count} icon="🧾" color="#fbbf24" delay={240} />
        </div>

        {/* Budget bar */}
        {budget > 0 && (
          <div className="budget-bar-wrap" style={{ animationDelay: '300ms' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Monthly Budget
                </span>
                {budgetOver && (
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>
                    Over budget!
                  </span>
                )}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                ₹{thisMonth.toLocaleString('en-IN')} / ₹{budget.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="budget-bar-track">
              <div
                className={`budget-bar-fill${budgetOver ? ' over' : ''}`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Two-column grid */}
        <div className="dashboard-grid">
          <div>
            <ExpenseChart expenses={expenses} />
          </div>

          {/* Recent Transactions */}
          <div className="transactions-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3>Recent</h3>
              <Link to="/history" style={{ fontSize: 13 }}>View all →</Link>
            </div>

            {recentFive.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-state-icon">🧾</div>
                <p>No expenses yet</p>
              </div>
            ) : (
              recentFive.map(e => (
                <div className="transaction-row" key={e.id}>
                  <div className="transaction-info">
                    <div className="transaction-emoji">{getCategoryEmoji(e.category)}</div>
                    <div>
                      <div className="transaction-name">{e.category}</div>
                      <div className="transaction-date">{formatDate(e.date)}</div>
                    </div>
                  </div>
                  <div className="transaction-amount">-₹{e.amount.toLocaleString('en-IN')}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Link to="/add" className="fab">+</Link>
    </div>
  );
}
