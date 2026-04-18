import React, { useState } from 'react'
import { usePrincipalDashboard } from '../hooks/usePrincipalDashboard'
import type { Application } from '../types/workflow'
import ApplicationReviewDrawer from './ApplicationReviewDrawer'
import { supabase } from '../lib/supabase'

const PrincipalDashboardPanel: React.FC = () => {
  const { stats, applications, allApplications, isLoading, refresh } = usePrincipalDashboard()
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [approvals, setApprovals] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending')
  const [isReadOnly, setIsReadOnly] = useState(false)

  const openReview = async (app: Application, readOnly = false) => {
    const { data } = await supabase
      .from('approvals')
      .select('*')
      .eq('application_id', app.id)
    
    setApprovals(data || [])
    setSelectedApp(app)
    setIsReadOnly(readOnly)
  }

  if (isLoading) return <div className="loader"></div>

  return (
    <div className="panel-container">
      <div className="stats-row principal">
        <div className="stat-card">
          <div className="label">Pending Final Approval</div>
          <div className="stat-value">{stats.awaiting}</div>
        </div>
        <div className="stat-card">
          <div className="label">Fully Approved</div>
          <div className="stat-value" style={{ color: '#10B981' }}>{stats.approved}</div>
        </div>
        <div className="stat-card">
          <div className="label">Rejected Anywhere</div>
          <div className="stat-value" style={{ color: '#EF4444' }}>{stats.rejected}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Applications</div>
          <div className="stat-value">{stats.total}</div>
        </div>
      </div>

      <div className="content-section">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Needs Final Approval
          </button>
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Institution Applications
          </button>
        </div>

        <div className="table-container">
          <table className="nexus-table">
            <thead>
              <tr>
                <th>STUDENT NAME</th>
                <th>DEPARTMENT</th>
                <th>SUBMITTED DATE</th>
                <th>CURRENT STAGE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'pending' ? applications : allApplications).length > 0 ? (
                (activeTab === 'pending' ? applications : allApplications).map(app => (
                <tr key={app.id}>
                  <td>
                    <div className="student-cell">
                      <span className="name">{app.student?.full_name}</span>
                      <span className="username label">@{app.student?.username}</span>
                    </div>
                  </td>
                  <td>{app.department || 'N/A'}</td>
                  <td>{new Date(app.created_at).toLocaleDateString()}</td>
                  <td><span className="badge stage">{app.current_stage.toUpperCase()}</span></td>
                  <td>
                    <span className={`badge status ${app.status}`}>
                      {app.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="review-btn" 
                      onClick={() => openReview(app, activeTab === 'all' && app.current_stage !== 'principal')}
                    >
                      {activeTab === 'pending' ? 'Final Review' : 'View'}
                    </button>
                  </td>
                </tr>
              ))) : (
                <tr>
                  <td colSpan={6} className="empty-row text-center">No applications found.</td>
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
          actorRole="principal"
          readOnly={isReadOnly}
          onClose={() => setSelectedApp(null)}
          onAction={refresh}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .stats-row.principal { grid-template-columns: repeat(4, 1fr); }
        .tabs { display: flex; gap: 30px; border-bottom: 1px solid #1a1a1a; margin-bottom: 30px; }
        .tab-btn { 
          padding: 15px 5px; 
          font-size: 0.75rem; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 0.1em; 
          opacity: 0.4; 
          transition: all 0.3s;
          position: relative;
        }
        .tab-btn.active { opacity: 1; color: #F59E0B; }
        .tab-btn.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: #F59E0B; }
        
        .nexus-table { width: 100%; border-collapse: collapse; }
        .nexus-table th { text-align: left; padding: 20px; font-size: 0.65rem; color: #444; letter-spacing: 0.1em; border-bottom: 1px solid #1a1a1a; }
        .nexus-table td { padding: 20px; border-bottom: 1px solid #111; font-size: 0.9rem; }
        
        .badge { font-size: 0.6rem; font-weight: 800; padding: 4px 10px; border-radius: 100px; text-transform: uppercase; }
        .badge.stage { background: rgba(255,255,255,0.05); color: #888; }
        .badge.status.lab_pending { color: #00D1FF; }
        .badge.status.hod_pending { color: #A855F7; }
        .badge.status.principal_pending { color: #F59E0B; }
        .badge.status.approved { color: #10B981; }
        .badge.status.rejected { color: #EF4444; }

        .review-btn { padding: 8px 20px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); color: #F59E0B; border-radius: 4px; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; }
      ` }} />
    </div>
  )
}

export default PrincipalDashboardPanel
