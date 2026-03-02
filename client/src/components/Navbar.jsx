import { Link, useLocation, useNavigate } from 'react-router-dom';

const LINKS = [
    { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { to: '/add', label: 'Add', icon: '+' },
    { to: '/history', label: 'History', icon: '≡' },
];

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = localStorage.getItem('userEmail') || '';

    const logout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        navigate('/');
    };

    return (
        <nav className="navbar">
            <Link to="/dashboard" className="navbar-brand">
                <div className="navbar-brand-icon">💸</div>
                SmartExpense
            </Link>

            <div className="navbar-links">
                {LINKS.map(({ to, label, icon }) => (
                    <Link
                        key={to}
                        to={to}
                        className={`navbar-link${location.pathname === to ? ' active' : ''}`}
                    >
                        <span style={{ marginRight: 4 }}>{icon}</span>{label}
                    </Link>
                ))}
            </div>

            <div className="navbar-user">
                {email && <span className="navbar-email">{email}</span>}
                <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }} onClick={logout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}
