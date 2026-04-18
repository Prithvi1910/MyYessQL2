import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import NotificationPanel from './NotificationPanel';

interface NavbarProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onLoginClick, 
  onRegisterClick 
}) => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    // The App component will naturally redirect us once the user state is null
  };

  return (
    <nav className="navbar">
      <div className="container nav-container" style={{ position: 'relative' }}>
        <Link to="/" className="logo-group" style={{ textDecoration: 'none' }}>
          <div className="logo serif italic">NEXUS</div>
        </Link>
        
        <div className="nav-links">
          {!user ? (
            <>
              <button onClick={onLoginClick} className="label">Log In</button>
              <button onClick={onRegisterClick} className="label">Register</button>
              <button onClick={onLoginClick} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.6rem', marginLeft: '20px' }}>Portal Access</button>
            </>
          ) : (
            <div className="nav-identity">
              <div className="student-info">
                <span className="student-name">{user.email?.split('@')[0]}</span>
                <span className="student-batch">
                  {role === 'admin' ? 'Librarian · Authority' : 
                   role === 'hod' ? 'HOD · Department' :
                   role === 'lab' ? 'Lab Assistant' :
                   role === 'principal' ? 'Principal · Nexus' :
                   'SE · 2025'}
                </span>
              </div>

              <button 
                className="bell-btn"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <div className="unread-badge"></div>
              </button>

              <button 
                onClick={handleSignOut} 
                className="label" 
                style={{ color: 'var(--accent-color)', cursor: 'pointer', marginLeft: '10px' }}
              >
                Sign Out
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <>
                    <div 
                      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999 }}
                      onClick={() => setIsNotifOpen(false)}
                    />
                    <NotificationPanel />
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
