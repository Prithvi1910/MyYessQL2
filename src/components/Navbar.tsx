import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import NotificationPanel from './NotificationPanel';

interface NavbarProps {
  onLogout?: () => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  isAuthenticated?: boolean;
  studentName?: string;
  batch?: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onLogout, 
  onLoginClick, 
  onRegisterClick, 
  isAuthenticated,
  studentName = "Hritani Sharma",
  batch = "SE · 2025"
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container nav-container" style={{ position: 'relative' }}>
        <div className="logo-group">
          <div className="logo serif italic">NEXUS</div>
        </div>
        
        {!isAuthenticated ? (
          <div className="nav-links">
            <button onClick={onLoginClick} className="label">Log In</button>
            <button onClick={onRegisterClick} className="label">Register</button>
            <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.6rem' }}>Portal Access</button>
          </div>
        ) : (
          <div className="nav-identity">
            <div className="student-info">
              <span className="student-name">{studentName}</span>
              <span className="student-batch">{batch}</span>
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
              onClick={onLogout} 
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
    </nav>
  );
};

export default Navbar;
