import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

const Navbar = ({ onLoginClick, onRegisterClick }: NavbarProps) => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo-group" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo-icon" />
          <div className="logo serif italic">NEXUS</div>
        </Link>
        
        <div className="nav-links">
          {!user ? (
            <>
              <button onClick={onLoginClick} className="label">Log In</button>
              <button onClick={onRegisterClick} className="label">Register</button>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="label" style={{ textDecoration: 'none' }}>Dashboard</Link>
              {role && role !== 'student' && (
                <Link to="/admin" className="label" style={{ textDecoration: 'none' }}>Console</Link>
              )}
              <a href="#" className="label">Registry</a>
              <button 
                onClick={handleSignOut} 
                className="label" 
                style={{ color: 'var(--accent-color)', cursor: 'pointer', marginLeft: '20px' }}
              >
                Sign Out
              </button>
            </>
          )}
        </div>

        {!user ? (
          <button onClick={onLoginClick} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.6rem' }}>Portal Access</button>
        ) : (
          <button onClick={handleSignOut} className="nav-menu label">Secure Out</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
