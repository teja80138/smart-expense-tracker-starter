
export default function ExpenseTable({ expenses = [] }) {
  return (
    <table border="1" style={{ marginTop: '20px' }}>
      <thead>
        <tr>
          <th>Amount</th>
          <th>Category</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map(e => (
          <tr key={e.id}>
            <td>{e.amount}</td>
            <td>{e.category}</td>
            <td>{e.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
