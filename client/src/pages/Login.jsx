import { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

// ─── Forgot Password Flow ─────────────────────────────────────────────────────
// Step 1: Enter email  →  Step 2: Enter OTP code  →  Step 3: Set new password

function ForgotPasswordFlow({ onBack }) {
  const [step, setStep] = useState(1); // 1 | 2 | 3
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState(''); // shown in dev mode
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1 – request OTP
  const handleRequestOtp = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp = await API.post('/forgot-password', { email: email.trim() });
      if (resp.data.devOtp) setDevOtp(resp.data.devOtp); // dev only
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 – verify OTP (just advance; real verification happens at step 3)
  const handleVerifyOtp = e => {
    e.preventDefault();
    setError('');
    if (otp.trim().length !== 6) { setError('Enter the 6-digit code'); return; }
    setStep(3);
  };

  // Step 3 – set new password
  const handleReset = async e => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await API.post('/reset-password', { email: email.trim(), otp: otp.trim(), newPassword });
      setSuccess('Password reset! You can now sign in.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = ['Reset Password', 'Enter Your Code', 'New Password'];
  const stepSubtitles = [
    "We'll send a 6-digit code to your email",
    `Code sent to ${email}`,
    'Choose a strong new password',
  ];

  if (success) {
    return (
      <>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)' }}>All done!</h2>
          <p style={{ fontSize: 14, marginTop: 6 }}>{success}</p>
        </div>
        <button className="btn btn-primary btn-block" onClick={onBack}>
          Back to Sign In
        </button>
      </>
    );
  }

  return (
    <>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[1, 2, 3].map(n => (
          <div key={n} style={{
            flex: 1, height: 4, borderRadius: 99,
            background: n <= step ? 'var(--accent)' : 'var(--bg-elevated)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      <h2 className="login-title" style={{ marginBottom: 4, fontSize: 20 }}>
        {stepTitles[step - 1]}
      </h2>
      <p className="login-subtitle" style={{ marginBottom: 24 }}>
        {stepSubtitles[step - 1]}
      </p>

      {/* Step 1 — Email */}
      {step === 1 && (
        <form onSubmit={handleRequestOtp}>
          <div className="field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          {error && <ErrorBox msg={error} />}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <Spinner label="Sending code…" /> : 'Send Reset Code'}
          </button>
        </form>
      )}

      {/* Step 2 — OTP */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <div className="field">
            <label>6-digit code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoFocus
              style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center', fontWeight: 700 }}
            />
          </div>

          {/* Dev-mode OTP hint */}
          {devOtp && (
            <div style={{
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              marginBottom: 16,
              fontSize: 13,
              color: 'var(--warning)',
            }}>
              🔧 <strong>Dev mode:</strong> your code is <strong style={{ letterSpacing: 3 }}>{devOtp}</strong>
              <br /><span style={{ fontSize: 11, opacity: 0.7 }}>Remove devOtp from the API response in production.</span>
            </div>
          )}

          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', padding: 0 }}
              onClick={() => { setStep(1); setOtp(''); setDevOtp(''); setError(''); }}
            >
              Resend code
            </button>
          </div>

          {error && <ErrorBox msg={error} />}
          <button type="submit" className="btn btn-primary btn-block">
            Verify Code →
          </button>
        </form>
      )}

      {/* Step 3 — New password */}
      {step === 3 && (
        <form onSubmit={handleReset}>
          <div className="field">
            <label>New password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                autoFocus
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: 16, padding: 0,
                }}
              >{showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <div className="field">
            <label>Confirm password</label>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Password strength bar */}
          {newPassword.length > 0 && (
            <StrengthBar password={newPassword} />
          )}

          {error && <ErrorBox msg={error} />}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <Spinner label="Resetting…" /> : 'Reset Password'}
          </button>
        </form>
      )}

      <p className="login-footer" style={{ marginTop: 20 }}>
        <a href="#" onClick={e => { e.preventDefault(); onBack(); }}>← Back to Sign In</a>
      </p>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ErrorBox({ msg }) {
  return (
    <div style={{
      background: 'var(--danger-bg)',
      border: '1px solid rgba(248,113,113,0.25)',
      borderRadius: 'var(--radius-sm)',
      padding: '10px 14px',
      marginBottom: 16,
      fontSize: 13,
      color: 'var(--danger)',
    }}>
      ⚠️ {msg}
    </div>
  );
}

function Spinner({ label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
      <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff4', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      {label}
    </span>
  );
}

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–5
}

function StrengthBar({ password }) {
  const score = getStrength(password);
  const labels = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const colors = ['', '#f87171', '#fb923c', '#fbbf24', '#34d399', '#22d3a0'];
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: n <= score ? colors[score] : 'var(--bg-elevated)',
            transition: 'background 0.25s',
          }} />
        ))}
      </div>
      {score > 0 && (
        <p style={{ fontSize: 11, color: colors[score], margin: 0, textAlign: 'right' }}>
          {labels[score]}
        </p>
      )}
    </div>
  );
}

// ─── Main Login Component ─────────────────────────────────────────────────────
export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isSignUp = mode === 'signup';

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const url = isSignUp ? '/signup' : '/login';
      const resp = await API.post(url, { email: email.trim(), password });
      const { id, email: userEmail } = resp.data;
      localStorage.setItem('userId', id);
      localStorage.setItem('userEmail', userEmail);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo — always shown */}
        <div className="login-logo">
          <div className="login-logo-icon">💸</div>
          <h1 className="login-title">SmartExpense</h1>
        </div>

        {/* ── Forgot Password Flow ── */}
        {mode === 'forgot' ? (
          <ForgotPasswordFlow onBack={() => { setMode('login'); setError(''); }} />
        ) : (
          <>
            <p className="login-subtitle" style={{ marginBottom: 28 }}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', fontSize: 16, padding: 0,
                    }}
                  >{showPass ? '🙈' : '👁️'}</button>
                </div>
              </div>

              {/* Remember me + Forgot (login only) */}
              {!isSignUp && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ width: 'auto' }} /> Remember me
                  </label>
                  <a
                    href="#"
                    style={{ fontSize: 13 }}
                    onClick={e => { e.preventDefault(); setMode('forgot'); setError(''); }}
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              {error && <ErrorBox msg={error} />}

              <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 4 }}>
                {loading
                  ? <Spinner label={isSignUp ? 'Creating account…' : 'Signing in…'} />
                  : (isSignUp ? 'Create Account' : 'Sign In')
                }
              </button>
            </form>

            <p className="login-footer">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <a href="#" onClick={e => { e.preventDefault(); setMode(isSignUp ? 'login' : 'signup'); setError(''); }}>
                {isSignUp ? 'Sign in' : 'Sign up free'}
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
