import { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const url = isSignUp ? '/signup' : '/login';
      const resp = await API.post(url, { email, password });
      const { id } = resp.data;
      localStorage.setItem('userId', id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 style={{ textAlign: 'center' }}>🧾 Smart Expense</h1>
        <h2 style={{ textAlign: 'center' }}>
          {isSignUp ? 'Create account' : 'Welcome back'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email</label>
            <input
              className="input-underline"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              className="input-underline"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {!isSignUp && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '14px' }}>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" style={{ fontSize: '14px' }} onClick={e => e.preventDefault()}>
                Forgot?
              </a>
            </div>
          )}
          <button type="submit" style={{ width: '100%' }}>
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          {isSignUp ? 'Already have an account?' : "Don't have one?"}{' '}
          <a href="#" onClick={() => setIsSignUp(prev => !prev)}>
            {isSignUp ? 'Login' : 'Sign up'}
          </a>
        </p>
      </div>
    </div>
  );
}
