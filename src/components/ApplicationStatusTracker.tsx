import React from 'react'
import type { Application, Approval } from '../types/workflow'

interface ApplicationStatusTrackerProps {
  application: Application
  approvals: Approval[]
}

const ApplicationStatusTracker: React.FC<ApplicationStatusTrackerProps> = ({ application, approvals }) => {
  const stages = [
    { role: 'lab', label: 'Lab Assistant' },
    { role: 'hod', label: 'HOD' },
    { role: 'principal', label: 'Principal' }
  ]

  const getStageStatus = (role: string) => {
    const approval = approvals.find(a => a.role === role)
    if (!approval) return 'pending'
    return approval.status
  }

  const getStageComment = (role: string) => {
    const approval = approvals.find(a => a.role === role)
    return approval?.comment
  }

  return (
    <div className="status-tracker">
      <div className="tracker-pipeline">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.role)
          const isActive = application.current_stage === stage.role
          const isDone = application.current_stage === 'done' || 
                         (index === 0 && (application.current_stage === 'hod' || application.current_stage === 'principal')) ||
                         (index === 1 && application.current_stage === 'principal')

          return (
            <React.Fragment key={stage.role}>
              <div className={`stage-node ${status} ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                <div className="node-icon">
                  {status === 'approved' ? '✓' : status === 'rejected' ? '✕' : index + 1}
                </div>
                <div className="node-info">
                  <div className="node-label">{stage.label}</div>
                  <div className="node-status-text">{status.toUpperCase()}</div>
                </div>
                {getStageComment(stage.role) && (
                  <div className="node-comment">
                    "<em>{getStageComment(stage.role)}</em>"
                  </div>
                )}
              </div>
              {index < stages.length - 1 && (
                <div className={`pipeline-connector ${isDone ? 'done' : ''}`}></div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .status-tracker {
          padding: 40px 0;
          width: 100%;
        }
        .tracker-pipeline {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          position: relative;
        }
        .stage-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex: 1;
          z-index: 2;
          position: relative;
        }
        .node-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #1a1a1a;
          border: 2px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 12px;
          transition: all 0.3s ease;
          color: #666;
        }
        .stage-node.active .node-icon {
          border-color: var(--accent-color);
          box-shadow: 0 0 15px rgba(201, 168, 76, 0.3);
          color: var(--accent-color);
          background: rgba(201, 168, 76, 0.1);
        }
        .stage-node.approved .node-icon, .stage-node.done .node-icon {
          background: #10B981;
          border-color: #10B981;
          color: #000;
        }
        .stage-node.rejected .node-icon {
          background: #EF4444;
          border-color: #EF4444;
          color: #fff;
        }
        .node-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        .node-status-text {
          font-size: 0.6rem;
          font-weight: 800;
          opacity: 0.5;
        }
        .node-comment {
          margin-top: 12px;
          font-size: 0.7rem;
          color: var(--text-secondary);
          background: rgba(255,255,255,0.03);
          padding: 8px 12px;
          border-radius: 4px;
          max-width: 150px;
          word-wrap: break-word;
        }
        .pipeline-connector {
          flex: 0;
          width: 100%;
          height: 2px;
          background: #333;
          margin-top: 20px;
          margin-left: -40px;
          margin-right: -40px;
          z-index: 1;
        }
        .pipeline-connector.done {
          background: #10B981;
        }
      ` }} />
    </div>
  )
}

export default ApplicationStatusTracker
