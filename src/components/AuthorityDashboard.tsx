import React from 'react';
import { useAuthority } from '../hooks/useAuthority';
import { useNavigate } from 'react-router-dom';

const AuthorityDashboard: React.FC = () => {
  const { profile, signOut } = useAuthority();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/authority/login');
  };

  const getRoleDisplay = () => {
    switch (profile?.role) {
      case 'lab': return 'Lab Assistant';
      case 'hod': return 'Head of Department';
      case 'principal': return 'Principal';
      case 'admin': return 'Librarian';
      default: return 'Portal';
    }
  };

  const renderSidebarLinks = () => {
    const role = profile?.role;
    const links = {
      lab: [
        { label: 'Pending Applications', active: true },
        { label: 'Cleared Students', active: false },
        { label: 'Lab Dues Management', active: false },
        { label: 'Inventory Checklist', active: false }
      ],
      hod: [
        { label: 'Applications Awaiting HOD', active: true },
        { label: 'Department Overview', active: false },
        { label: 'Faculty Escalations', active: false },
        { label: 'Approval History', active: false }
      ],
      principal: [
        { label: 'Final Approvals', active: true },
        { label: 'Certificate Queue', active: false },
        { label: 'Full Student Registry', active: false },
        { label: 'Institution Metrics', active: false }
      ],
      admin: [
        { label: 'CSV Dues Upload', active: true },
        { label: 'Student Dues Registry', active: false },
        { label: 'Cleared Students', active: false },
        { label: 'System Logs', active: false }
      ],
    }[role as keyof typeof links] || [];

    return links.map((link, i) => (
      <div key={i} className={`nav-item ${link.active ? 'active' : ''}`}>
        {link.label}
      </div>
    ));
  };

  const renderContentPanel = () => {
    const role = profile?.role;
    if (!role) return null;

    const config = {
      lab: {
        title: 'Lab Assistant Dashboard',
        subtext: 'Engineering Labs & Research Facilities Access Control',
        theme: '#00D1FF', // Cyan
        stats: [
          { label: 'Pending Clearances', val: '12' },
          { label: 'Approved Today', val: '45' },
          { label: 'Flagged Equipments', val: '3' }
        ],
        placeholder: 'Review and verify laboratory-specific dues and equipment returns for students in the clearance pipeline.'
      },
      hod: {
        title: 'HOD Dashboard',
        subtext: 'Departmental Oversight & Senior Approvals',
        theme: '#A855F7', // Purple
        stats: [
          { label: 'Awaiting Sign-off', val: '08' },
          { label: 'Total Approved', val: '124' },
          { label: 'Dues Flagged', val: '2' }
        ],
        placeholder: 'Secondary validation of student eligibility and departmental compliance records.'
      },
      principal: {
        title: "Principal's Dashboard",
        subtext: 'Apex Authority & Certification Control',
        theme: '#F59E0B', // Amber/Gold
        stats: [
          { label: 'Final Queue', val: '05' },
          { label: 'Certificates Pending', val: '18' },
          { label: 'Rejections', val: '1' }
        ],
        placeholder: 'Final executive oversight for the entire clearance process and batch certificate generation.'
      },
      admin: {
        title: 'Librarian Dashboard',
        subtext: 'Library Resource & Central Dues Registry',
        theme: '#10B981', // Emerald
        stats: [
          { label: 'Outstanding Dues', val: '56' },
          { label: 'Cleared Records', val: '512' },
          { label: 'Last CSV Upload', val: '2h ago' }
        ],
        placeholder: 'Manage student library accounts, book returns, and mass-import dues data via institutional CSV files.'
      }
    }[role as keyof typeof config];

    if (!config) return null;

    return (
      <div className="panel-container" style={{ '--role-accent': config.theme } as React.CSSProperties}>
        <div className="panel-header">
          <div className="role-indicator" style={{ background: config.theme }}></div>
          <h2 className="panel-title serif">{config.title}</h2>
          <p className="panel-subtext">{config.subtext}</p>
        </div>

        <div className="stats-grid">
          {config.stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-label label">{stat.label}</div>
              <div className="stat-value" style={{ color: config.theme }}>{stat.val}</div>
              <div className="stat-decoration"></div>
            </div>
          ))}
        </div>

        <div className="focus-area">
          <div className="focus-header">
            <h3 className="serif">Operational Focus</h3>
            <div className="action-pill" style={{ borderColor: config.theme, color: config.theme }}>Active Session</div>
          </div>
          <div className="focus-card">
            <p className="focus-text">{config.placeholder}</p>
            <div className="skeleton-list">
              {[1, 2, 3].map(n => (
                <div key={n} className="skeleton-row"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <nav className="dash-nav">
        <div className="dash-nav-left">
          <div className="logo" style={{ fontSize: '1.5rem', marginBottom: '0' }}>Nexus</div>
        </div>
        
        <div className="dash-nav-center">
          <div className="role-badge">
            <span className="dot" style={{ background: profile?.role === 'admin' ? '#10B981' : profile?.role === 'hod' ? '#A855F7' : profile?.role === 'lab' ? '#00D1FF' : '#F59E0B' }}></span>
            {getRoleDisplay().toUpperCase()} PORTAL
          </div>
        </div>

        <div className="dash-nav-right">
          <div className="user-profile">
            <div className="user-avatar">{profile?.full_name?.charAt(0)}</div>
            <span className="user-name">{profile?.full_name}</span>
          </div>
          <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
        </div>
      </nav>

      <div className="dash-body">
        {/* Left Sidebar */}
        <aside className="dash-sidebar">
          <div className="sidebar-group">
            <label className="label" style={{ opacity: 0.4, marginBottom: '20px', display: 'block' }}>Primary Links</label>
            {renderSidebarLinks()}
          </div>
          
          <div className="sidebar-footer">
            <div className="version-info">Build v2.4.0-auth</div>
            <div className="system-status">
              <div className="status-dot"></div>
              <span>System Live</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dash-content">
          {renderContentPanel()}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-layout {
          min-height: 100vh;
          background: #080808;
          display: flex;
          flex-direction: column;
          color: var(--text-primary);
        }
        .dash-nav {
          height: 70px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 40px;
          background: rgba(8, 8, 8, 0.8);
          backdrop-filter: blur(20px);
          z-index: 10;
        }
        .role-badge {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-color);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.8rem;
        }
        .dash-nav-right {
          display: flex;
          align-items: center;
          gap: 30px;
        }
        .user-name {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .sign-out-btn {
          color: #ff4d4d;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          opacity: 0.8;
          transition: opacity 0.3s;
          font-weight: 600;
        }
        .sign-out-btn:hover {
          opacity: 1;
        }
        .dash-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .dash-sidebar {
          width: 280px;
          border-right: 1px solid var(--border-color);
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: rgba(255,255,255,0.01);
        }
        .nav-item {
          padding: 14px 20px;
          margin: 0 -20px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.3s;
          border-radius: 4px;
        }
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
        }
        .nav-item.active {
          color: var(--accent-color);
          background: rgba(201, 168, 76, 0.05);
          font-weight: 600;
        }
        .dash-content {
          flex: 1;
          padding: 60px 80px;
          overflow-y: auto;
        }
        .panel-header {
          margin-bottom: 60px;
          position: relative;
        }
        .role-indicator {
          width: 40px;
          height: 4px;
          border-radius: 2px;
          margin-bottom: 20px;
        }
        .panel-title {
          font-size: 4rem;
          line-height: 1;
          margin-bottom: 16px;
        }
        .panel-subtext {
          color: var(--text-secondary);
          font-size: 1.1rem;
          max-width: 600px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin-bottom: 80px;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 40px 30px;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.03);
        }
        .stat-value {
          font-size: 3.5rem;
          font-family: 'Newsreader', serif;
          font-style: italic;
          margin-top: 15px;
        }
        .focus-area {
           margin-top: 40px;
        }
        .focus-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .focus-header h3 {
          font-size: 1.5rem;
        }
        .action-pill {
          padding: 6px 14px;
          border: 1px solid;
          border-radius: 100px;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 700;
        }
        .focus-card {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          padding: 40px;
          border-radius: 8px;
        }
        .focus-text {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 30px;
          max-width: 800px;
        }
        .skeleton-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .skeleton-row {
          height: 50px;
          background: rgba(255, 255, 255, 0.02);
          width: 100%;
          border-radius: 4px;
        }
        .version-info {
           font-size: 0.6rem;
           color: #333;
           margin-bottom: 10px;
        }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot { width: 6px; height: 6px; background: #4caf50; border-radius: 50%; }
        .system-status { display: flex; align-items: center; gap: 8px; font-size: 0.6rem; text-transform: uppercase; color: #4caf50; }
      ` }} />
    </div>
  );
};

export default AuthorityDashboard;
