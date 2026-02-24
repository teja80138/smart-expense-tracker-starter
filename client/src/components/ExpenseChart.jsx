
export default function ExpenseChart({ expenses = [] }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const perCat = {};
  expenses.forEach(e => {
    perCat[e.category] = (perCat[e.category] || 0) + e.amount;
  });
  const max = Math.max(...Object.values(perCat), 0);
  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '20px',
        marginTop: '20px',
        background: '#fff',
      }}
    >
      <h4>Expenses Chart (total ₹{total})</h4>
      {Object.entries(perCat).map(([cat, amt]) => (
        <div key={cat} style={{ margin: '5px 0' }}>
          <strong>{cat}</strong> ¥{amt}
          <div
            style={{
              height: '10px',
              background: '#0077cc',
              width: `${(amt / max) * 100}%`,
              transition: 'width 0.3s',
            }}
          ></div>
        </div>
      ))}
      {!expenses.length && <div>No expenses yet</div>}
    </div>
  );
}
