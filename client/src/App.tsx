import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import History from './pages/History';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/add" element={<AddExpense />} />
      <Route path="/history" element={<History />} />
    </Routes>
  );
}

export default App;
