const CATEGORY_META = {
  Food: { emoji: '🍔', color: 'linear-gradient(90deg, #f87171, #ef4444)' },
  Travel: { emoji: '✈️', color: 'linear-gradient(90deg, #60a5fa, #3b82f6)' },
  Groceries: { emoji: '🛒', color: 'linear-gradient(90deg, #34d399, #10b981)' },
  Utilities: { emoji: '💡', color: 'linear-gradient(90deg, #fbbf24, #f59e0b)' },
  Health: { emoji: '💊', color: 'linear-gradient(90deg, #a78bfa, #8b5cf6)' },
  Shopping: { emoji: '🛍️', color: 'linear-gradient(90deg, #f472b6, #ec4899)' },
  Other: { emoji: '📦', color: 'linear-gradient(90deg, #9ca3af, #6b7280)' },
};

function getColor(cat) {
  return CATEGORY_META[cat]?.color || 'linear-gradient(90deg, #6c63ff, #a78bfa)';
}

function getEmoji(cat) {
  return CATEGORY_META[cat]?.emoji || '💰';
}

export default function ExpenseChart({ expenses = [] }) {
  if (!expenses.length) {
    return (
      <div className="chart-card">
        <h3>📊 Spending by Category</h3>
        <div className="empty-state" style={{ padding: '32px 0' }}>
          <div className="empty-state-icon">📊</div>
          <p>Add expenses to see your chart</p>
        </div>
      </div>
    );
  }

  const perCat = {};
  expenses.forEach(e => {
    perCat[e.category] = (perCat[e.category] || 0) + e.amount;
  });

  const total = Object.values(perCat).reduce((s, v) => s + v, 0);
  const max = Math.max(...Object.values(perCat), 0);

  const sorted = Object.entries(perCat).sort(([, a], [, b]) => b - a);

  return (
    <div className="chart-card">
      <h3>📊 Spending by Category</h3>
      {sorted.map(([cat, amt]) => (
        <div className="chart-row" key={cat}>
          <div className="chart-label">
            <span>{getEmoji(cat)}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat}</span>
          </div>
          <div className="chart-bar-track">
            <div
              className="chart-bar-fill"
              style={{
                width: `${(amt / max) * 100}%`,
                background: getColor(cat),
              }}
            />
          </div>
          <div className="chart-amount">
            ₹{amt >= 1000 ? (amt / 1000).toFixed(1) + 'k' : amt}
          </div>
        </div>
      ))}
      <div style={{
        marginTop: 16,
        paddingTop: 12,
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 13,
        color: 'var(--text-muted)',
      }}>
        <span>Total</span>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          ₹{total.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}
