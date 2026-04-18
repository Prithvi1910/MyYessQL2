import React from 'react';

interface NavbarProps {
  onLogout?: () => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  isAuthenticated?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout, onLoginClick, onRegisterClick, isAuthenticated }) => {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="logo-group">
          <div className="logo-icon" />
          <div className="logo serif italic">NEXUS</div>
        </div>
        
        <div className="nav-links">
          {!isAuthenticated ? (
            <>
              <button onClick={onLoginClick} className="label">Log In</button>
              <button onClick={onRegisterClick} className="label">Register</button>
            </>
          ) : (
            <>
              <a href="#" className="label">Portal</a>
              <a href="#" className="label">Protocol</a>
              <a href="#" className="label">Registry</a>
              <button 
                onClick={onLogout} 
                className="label" 
                style={{ color: 'var(--accent-color)', cursor: 'pointer', marginLeft: '20px' }}
              >
                Sign Out
              </button>
            </>
          )}
        </div>

        {!isAuthenticated ? (
          <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.6rem' }}>Portal Access</button>
        ) : (
          <button onClick={onLogout} className="nav-menu label">Secure Out</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
