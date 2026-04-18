import React, { useState } from 'react'
import { useLabDashboard } from '../hooks/useLabDashboard'
import type { Application } from '../types/workflow'
import ApplicationReviewDrawer from './ApplicationReviewDrawer'
import { supabase } from '../lib/supabase'

const LabDashboardPanel: React.FC = () => {
  const { stats, applications, isLoading, refresh } = useLabDashboard()
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [approvals, setApprovals] = useState<any[]>([])

  const openReview = async (app: Application) => {
    const { data } = await supabase
      .from('approvals')
      .select('*')
      .eq('application_id', app.id)
    
    setApprovals(data || [])
    setSelectedApp(app)
  }

  if (isLoading) return <div className="loader"></div>

  return (
    <div className="panel-container">
      <div className="stats-row">
        <div className="stat-card">
          <div className="label">Awaiting My Review</div>
          <div className="stat-value">{stats.awaiting}</div>
        </div>
        <div className="stat-card">
          <div className="label">Approved by Me</div>
          <div className="stat-value" style={{ color: '#10B981' }}>{stats.approved}</div>
        </div>
        <div className="stat-card">
          <div className="label">Rejected by Me</div>
          <div className="stat-value" style={{ color: '#EF4444' }}>{stats.rejected}</div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h3 className="serif">Submitted Applications</h3>
          <p className="label">STAGE: LAB ASSISTANT REVIEW</p>
        </div>

        <div className="table-container">
          <table className="nexus-table">
            <thead>
              <tr>
                <th>STUDENT NAME</th>
                <th>SUBMITTED DATE</th>
                <th>DOCS</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? applications.map(app => (
                <tr key={app.id}>
                  <td>
                    <div className="student-cell">
                      <span className="name">{app.student?.full_name}</span>
                      <span className="username label">@{app.student?.username}</span>
                    </div>
                  </td>
                  <td>{new Date(app.created_at).toLocaleDateString()}</td>
                  <td>{app.document_ids?.length || 0}</td>
                  <td><span className="badge pending">Awaiting Review</span></td>
                  <td>
                    <button className="review-btn" onClick={() => openReview(app)}>Review</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="empty-row text-center">No applications pending review.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApp && (
        <ApplicationReviewDrawer
          application={selectedApp}
          approvals={approvals}
          actorRole="lab"
          onClose={() => setSelectedApp(null)}
          onAction={refresh}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px; }
        .section-header { margin-bottom: 30px; }
        .nexus-table { width: 100%; border-collapse: collapse; }
        .nexus-table th { text-align: left; padding: 20px; font-size: 0.65rem; color: #444; letter-spacing: 0.1em; border-bottom: 1px solid #1a1a1a; }
        .nexus-table td { padding: 20px; border-bottom: 1px solid #111; font-size: 0.9rem; }
        .student-cell { display: flex; flex-direction: column; }
        .student-cell .username { font-size: 0.7rem; }
        .review-btn { 
          padding: 8px 20px; 
          background: rgba(201, 168, 76, 0.1); 
          border: 1px solid rgba(201, 168, 76, 0.2); 
          color: var(--accent-color); 
          border-radius: 4px; 
          font-weight: 700; 
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        .badge { font-size: 0.65rem; font-weight: 800; padding: 4px 10px; border-radius: 100px; text-transform: uppercase; }
        .badge.pending { background: rgba(255,165,0,0.1); color: orange; border: 1px solid rgba(255,165,0,0.2); }
      ` }} />
    </div>
  )
}

export default LabDashboardPanel
