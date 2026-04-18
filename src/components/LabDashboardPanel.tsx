import React, { useState } from 'react'
import { useLabDashboard } from '../hooks/useLabDashboard'
import type { ApplicationWithStudent } from '../types/workflow'
import ApplicationReviewDrawer from './ApplicationReviewDrawer'
import { FileText, Clock, CheckCircle, XCircle, Search, Inbox } from 'lucide-react'

const LabDashboardPanel: React.FC = () => {
  const { stats, applications, isLoading, refresh, error } = useLabDashboard()
  const [selectedApp, setSelectedApp] = useState<ApplicationWithStudent | null>(null)

  if (isLoading && applications.length === 0) {
    return (
      <div className="panel-skeleton-container">
        <div className="skeleton-stats">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
        <div className="skeleton-table"></div>
      </div>
    )
  }

  return (
    <div className="lab-panel-root">
      {error && <div className="error-banner">{error}</div>}

      <div className="stats-grid-row">
        <div className="stat-card-premium">
          <div className="stat-icon-bg awaiting"><Clock size={20} /></div>
          <div className="stat-main">
            <span className="stat-num">{stats.awaiting}</span>
            <span className="stat-label">Awaiting My Review</span>
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-icon-bg approved"><CheckCircle size={20} /></div>
          <div className="stat-main">
            <span className="stat-num">{stats.approved}</span>
            <span className="stat-label">Approved by Me</span>
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-icon-bg rejected"><XCircle size={20} /></div>
          <div className="stat-main">
            <span className="stat-num">{stats.rejected}</span>
            <span className="stat-label">Rejected by Me</span>
          </div>
        </div>
      </div>

      <div className="main-content-card">
        <div className="card-header-flex">
          <div className="title-group">
            <h3 className="serif">Applications Pending Review</h3>
            <p className="subtitle label">STAGE: LAB ASSISTANT</p>
          </div>
          <div className="search-bar-inline">
            <Search size={16} />
            <input type="text" placeholder="Search by name or UID..." disabled />
          </div>
        </div>

        <div className="nexus-table-wrapper">
          <table className="nexus-styled-table">
            <thead>
              <tr>
                <th>STUDENT NAME</th>
                <th>STUDENT UID</th>
                <th>PURPOSE</th>
                <th>DOCS</th>
                <th>SUBMITTED DATE</th>
                <th>STATUS</th>
                <th className="text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? applications.map(app => {
                let purposeType = 'N/A'
                try {
                   purposeType = app.purpose ? JSON.parse(app.purpose).type : 'N/A'
                } catch {
                   purposeType = app.purpose || 'N/A'
                }

                return (
                  <tr key={app.id}>
                    <td>
                      <div className="student-profile-cell">
                        <span className="full-name">{app.student?.full_name}</span>
                        <span className="username label">@{app.student?.username}</span>
                      </div>
                    </td>
                    <td><span className="uid-text mono">{app.student?.student_uid}</span></td>
                    <td><span className="purpose-label">{purposeType}</span></td>
                    <td>
                      <div className="docs-count">
                        <FileText size={14} />
                        <span>{app.document_ids?.length || 0}</span>
                      </div>
                    </td>
                    <td>{new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td><span className="badge-status-pending">Awaiting Review</span></td>
                    <td className="text-right">
                      <button className="review-action-btn" onClick={() => setSelectedApp(app)}>Review</button>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state-table">
                      <Inbox size={48} />
                      <h4>No applications awaiting your review.</h4>
                      <p>All applications in your department have been processed.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApp && (
        <ApplicationReviewDrawer
          application={selectedApp}
          actorRole="lab"
          onClose={() => setSelectedApp(null)}
          onAction={() => {
            setSelectedApp(null)
            refresh()
          }}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .lab-panel-root { animation: fadeIn 0.5s ease; }
        .stats-grid-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px; }
        
        .stat-card-premium {
          background: rgba(255,255,255,0.02);
          border: 1px solid #1a1a1a;
          padding: 30px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: 0.3s;
        }
        .stat-card-premium:hover { border-color: #333; transform: translateY(-2px); }
        .stat-icon-bg {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-icon-bg.awaiting { background: rgba(201, 168, 76, 0.1); color: var(--accent-color); }
        .stat-icon-bg.approved { background: rgba(16, 185, 129, 0.1); color: #10B981; }
        .stat-icon-bg.rejected { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
        .stat-main { display: flex; flex-direction: column; }
        .stat-num { font-size: 1.8rem; font-weight: 800; line-height: 1; margin-bottom: 4px; }
        .stat-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5; }

        .main-content-card { background: rgba(255,255,255,0.01); border: 1px solid #1a1a1a; border-radius: 16px; overflow: hidden; }
        .card-header-flex { padding: 30px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1a1a1a; }
        .title-group h3 { font-size: 1.5rem; margin: 0 0 4px 0; }
        .subtitle { color: #555; }
        .search-bar-inline { background: #0a0a0a; border: 1px solid #222; border-radius: 8px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; width: 300px; opacity: 0.5; }
        .search-bar-inline input { background: transparent; border: none; color: white; font-size: 0.85rem; width: 100%; outline: none; }

        .nexus-table-wrapper { width: 100%; overflow-x: auto; }
        .nexus-styled-table { width: 100%; border-collapse: collapse; text-align: left; }
        .nexus-styled-table th { padding: 20px 40px; font-size: 0.65rem; color: #444; font-weight: 800; letter-spacing: 0.15em; border-bottom: 1px solid #1a1a1a; }
        .nexus-styled-table td { padding: 24px 40px; border-bottom: 1px solid #0f0f0f; vertical-align: middle; }
        .nexus-styled-table tr:last-child td { border-bottom: none; }
        
        .student-profile-cell { display: flex; flex-direction: column; }
        .full-name { font-weight: 700; font-size: 1rem; color: var(--text-primary); }
        .username { font-size: 0.7rem; margin-top: 2px; }
        .uid-text { font-size: 0.9rem; color: var(--accent-color); font-weight: 600; }
        .purpose-label { font-size: 0.85rem; font-weight: 500; color: #aaa; }
        .docs-count { display: flex; align-items: center; gap: 6px; color: #666; font-size: 0.9rem; font-weight: 600; }
        
        .badge-status-pending { background: rgba(201, 168, 76, 0.05); color: var(--accent-color); border: 1px solid rgba(201, 168, 76, 0.1); padding: 6px 14px; border-radius: 100px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .review-action-btn { background: var(--accent-color); color: #000; font-weight: 800; font-size: 0.7rem; text-transform: uppercase; padding: 10px 24px; border-radius: 6px; transition: 0.3s; }
        .review-action-btn:hover { transform: scale(1.05); filter: brightness(1.1); box-shadow: 0 4px 15px rgba(201, 168, 76, 0.3); }

        .empty-state-table { padding: 80px 0; display: flex; flex-direction: column; align-items: center; text-align: center; color: #444; }
        .empty-state-table h4 { font-size: 1.2rem; color: #666; margin: 20px 0 8px 0; }
        .empty-state-table p { font-size: 0.9rem; max-width: 300px; }
        .empty-state-table svg { opacity: 0.2; }

        .text-right { text-align: right; }
        .mono { font-family: 'Courier New', Courier, monospace; }
        
        /* Skeleton */
        .panel-skeleton-container { display: flex; flex-direction: column; gap: 40px; }
        .skeleton-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .skeleton-card { height: 120px; background: rgba(255,255,255,0.02); border-radius: 12px; }
        .skeleton-table { height: 400px; background: rgba(255,255,255,0.01); border-radius: 16px; }
      ` }} />
    </div>
  )
}

export default LabDashboardPanel
