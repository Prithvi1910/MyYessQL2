import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Application, Approval, ApprovalRole, Document } from '../types/workflow'
import ApplicationStatusTracker from './ApplicationStatusTracker'

interface ApplicationReviewDrawerProps {
  application: Application
  approvals: Approval[]
  actorRole: ApprovalRole
  readOnly?: boolean
  onClose: () => void
  onAction: () => void
}

const ApplicationReviewDrawer: React.FC<ApplicationReviewDrawerProps> = ({
  application,
  approvals,
  actorRole,
  readOnly = false,
  onClose,
  onAction
}) => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  useEffect(() => {
    const fetchDocs = async () => {
      if (application.document_ids && application.document_ids.length > 0) {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .in('id', application.document_ids)
        
        if (!error && data) setDocuments(data)
      }
    }
    fetchDocs()
  }, [application.document_ids])

  const hasAlreadyActed = approvals.find(a => a.role === actorRole && a.status !== 'pending')

  const handleAction = async (status: 'approved' | 'rejected') => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('approvals')
        .update({
          status,
          comment,
          actor_id: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('application_id', application.id)
        .eq('role', actorRole)

      if (error) throw error
      onAction()
      onClose()
    } catch (err) {
      alert("Error processing action. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-side" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="student-info">
            <h3 className="serif">{application.student?.full_name || 'Student Name'}</h3>
            <p className="label"> @{application.student?.username || 'username'}</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-content">
          <section className="drawer-section">
            <h4 className="section-title">CLEARANCE PROGRESS</h4>
            <ApplicationStatusTracker application={application} approvals={approvals} />
          </section>

          <section className="drawer-section">
            <h4 className="section-title">ATTACHED DOCUMENTS</h4>
            <div className="docs-list">
              {documents.length > 0 ? documents.map(doc => (
                <div key={doc.id} className="doc-item">
                  <div className="doc-meta">
                    <div className="doc-name">{doc.file_name}</div>
                    <div className="doc-type label">{doc.file_type.split('/')[1]?.toUpperCase() || 'FILE'}</div>
                  </div>
                  <div className="doc-actions">
                    <button className="action-link" onClick={() => setSelectedDoc(doc)}>View</button>
                    <a href={doc.file_url} download className="action-link" target="_blank" rel="noreferrer">Download</a>
                  </div>
                </div>
              )) : <p className="empty-state">No documents attached.</p>}
            </div>
          </section>

          {!readOnly && !hasAlreadyActed && (
            <section className="drawer-section review-actions">
              <h4 className="section-title">YOUR REVIEW</h4>
              <textarea 
                placeholder="Add a comment (optional)..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="review-textarea"
              />
              <div className="action-buttons">
                <button 
                  className="btn-reject" 
                  disabled={isSubmitting}
                  onClick={() => handleAction('rejected')}
                >
                  Reject
                </button>
                <button 
                  className="btn-approve" 
                  disabled={isSubmitting}
                  onClick={() => handleAction('approved')}
                >
                  Approve Application
                </button>
              </div>
            </section>
          )}

          {hasAlreadyActed && (
            <section className="drawer-section review-history">
              <h4 className="section-title">YOUR DECISION</h4>
              <div className={`decision-badge ${hasAlreadyActed.status}`}>
                {hasAlreadyActed.status.toUpperCase()}
              </div>
              {hasAlreadyActed.comment && (
                <p className="decision-comment">"{hasAlreadyActed.comment}"</p>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Doc Viewer Modal */}
      {selectedDoc && (
        <div className="doc-viewer-layer" onClick={() => setSelectedDoc(null)}>
          <div className="viewer-container" onClick={e => e.stopPropagation()}>
            <div className="viewer-header">
              <span>{selectedDoc.file_name}</span>
              <button onClick={() => setSelectedDoc(null)}>✕</button>
            </div>
            <div className="viewer-body">
              {selectedDoc.file_type.includes('image') ? (
                <img src={selectedDoc.file_url} alt={selectedDoc.file_name} />
              ) : (
                <iframe src={selectedDoc.file_url} title="Document Viewer" />
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.3s ease;
        }
        .drawer-side {
          width: 600px;
          height: 100%;
          background: #0a0a0a;
          border-left: 1px solid #222;
          display: flex;
          flex-direction: column;
          box-shadow: -20px 0 50px rgba(0,0,0,0.5);
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .drawer-header {
          padding: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #1a1a1a;
        }
        .student-info h3 { font-size: 1.8rem; margin: 0; }
        .close-btn { font-size: 1.5rem; opacity: 0.5; transition: opacity 0.2s; }
        .close-btn:hover { opacity: 1; }

        .drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 60px;
        }
        .section-title {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          color: #444;
          margin-bottom: 24px;
        }
        .docs-list { display: flex; flex-direction: column; gap: 12px; }
        .doc-item {
          background: #0f0f0f;
          border: 1px solid #1a1a1a;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 4px;
        }
        .doc-name { font-size: 0.9rem; font-weight: 500; }
        .doc-actions { display: flex; gap: 20px; }
        .action-link { font-size: 0.75rem; color: var(--accent-color); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; }

        .review-textarea {
          width: 100%;
          height: 120px;
          background: #0f0f0f;
          border: 1px solid #222;
          border-radius: 8px;
          padding: 16px;
          color: white;
          font-family: inherit;
          margin-bottom: 24px;
          resize: none;
        }
        .action-buttons { display: flex; gap: 16px; }
        .btn-approve {
          flex: 2;
          background: var(--accent-color);
          color: #000;
          font-weight: 800;
          padding: 16px;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 0.8rem;
        }
        .btn-reject {
          flex: 1;
          background: #1a1a1a;
          color: #EF4444;
          border: 1px solid #332222;
          padding: 16px;
          border-radius: 8px;
          font-weight: 600;
        }

        .decision-badge { padding: 8px 16px; border-radius: 4px; font-weight: 800; font-size: 0.7rem; display: inline-block; margin-bottom: 12px; }
        .decision-badge.approved { background: rgba(16, 185, 129, 0.1); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .decision-badge.rejected { background: rgba(239, 68, 68, 0.1); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .decision-comment { font-style: italic; color: #666; font-size: 0.9rem; }

        /* Viewer Modal */
        .doc-viewer-layer {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.95);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .viewer-container {
          width: 90%;
          height: 90%;
          background: #111;
          display: flex;
          flex-direction: column;
          border-radius: 12px;
          overflow: hidden;
        }
        .viewer-header {
          padding: 20px 30px;
          border-bottom: 1px solid #222;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
        }
        .viewer-body { flex: 1; position: relative; }
        .viewer-body iframe { width: 100%; height: 100%; border: none; }
        .viewer-body img { width: 100%; height: 100%; object-fit: contain; }
      ` }} />
    </div>
  )
}

export default ApplicationReviewDrawer
