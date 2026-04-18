import React, { useState } from 'react'
import { useStudentApplication } from '../hooks/useStudentApplication'
import ApplicationStatusTracker from './ApplicationStatusTracker'

const StudentApplicationPage: React.FC = () => {
  const {
    application,
    approvals,
    vaultDocuments,
    isLoading,
    createApplication,
    updateDocumentSelection,
    submitApplication,
    error
  } = useStudentApplication()

  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(application?.document_ids || [])
  const [isSaving, setIsSaving] = useState(false)

  // Sync selection when application loads
  React.useEffect(() => {
    if (application?.document_ids) {
      setSelectedDocIds(application.document_ids)
    }
  }, [application])

  const toggleDocument = (docId: string) => {
    if (application?.is_submitted) return
    setSelectedDocIds(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    )
  }

  const handleSaveSelection = async () => {
    setIsSaving(true)
    await updateDocumentSelection(selectedDocIds)
    setIsSaving(false)
  }

  const handleSubmit = async () => {
    if (window.confirm("Once submitted, you cannot edit your application. Proceed?")) {
      await submitApplication()
    }
  }

  if (isLoading) return <div className="loader"></div>

  return (
    <div className="student-app-page">
      <div className="container">
        <header className="page-header">
          <h1 className="serif">Clearance Application</h1>
          <p className="label">INSTITUTIONAL WORKFLOW SYSTEM</p>
        </header>

        {error && <div className="error-banner">{error}</div>}

        {!application ? (
          <div className="empty-state-card">
            <h2 className="serif">Start Your Clearance</h2>
            <p>You haven't started an application yet. Create one to begin the multi-stage approval process.</p>
            <button className="primary-btn" onClick={createApplication}>Create Application</button>
          </div>
        ) : (
          <div className="app-layout">
            <aside className="app-status-sidebar">
              <div className="card">
                <h3 className="card-title label">APPLICATION STATUS</h3>
                <div className={`status-pill ${application.status}`}>
                  {application.status.replace('_', ' ').toUpperCase()}
                </div>
                <ApplicationStatusTracker application={application} approvals={approvals} />
              </div>
              
              {application.is_submitted && (
                 <div className="card submission-info">
                   <p className="label">SUBMITTED ON</p>
                   <p>{new Date(application.created_at).toLocaleDateString()}</p>
                   <p className="warning-text">Application is now locked for review.</p>
                 </div>
              )}
            </aside>

            <main className="app-main-content">
              <div className="card">
                <div className="card-header">
                  <h3 className="serif">Document Checklist</h3>
                  {!application.is_submitted && (
                    <div className="header-actions">
                      <button 
                        className="secondary-btn" 
                        onClick={handleSaveSelection}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Selection'}
                      </button>
                      <button 
                        className="primary-btn" 
                        disabled={selectedDocIds.length === 0}
                        onClick={handleSubmit}
                      >
                        Submit Application
                      </button>
                    </div>
                  )}
                </div>

                <div className="docs-grid">
                  {vaultDocuments.length > 0 ? vaultDocuments.map(doc => {
                    const isSelected = selectedDocIds.includes(doc.id)
                    return (
                      <div 
                        key={doc.id} 
                        className={`doc-card ${isSelected ? 'selected' : ''} ${application.is_submitted ? 'readonly' : ''}`}
                        onClick={() => toggleDocument(doc.id)}
                      >
                        <div className="doc-type-icon">{doc.file_type.split('/')[1]?.toUpperCase()}</div>
                        <div className="doc-info">
                          <span className="doc-name">{doc.file_name}</span>
                          <span className="doc-date label">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        </div>
                        <div className="checkbox">
                          {isSelected && <span className="check">✓</span>}
                        </div>
                      </div>
                    )
                  }) : (
                    <p className="empty-docs">No documents found in vault. Please upload documents first.</p>
                  )}
                </div>
              </div>

              {application.is_submitted && (
                <div className="card">
                   <h3 className="serif">Attached Documents</h3>
                   <div className="attached-list">
                      {vaultDocuments
                        .filter(d => application.document_ids.includes(d.id))
                        .map(doc => (
                          <div key={doc.id} className="attached-item">
                            <span>{doc.file_name}</span>
                            <a href={doc.file_url} target="_blank" rel="noreferrer" className="label">VIEW</a>
                          </div>
                        ))
                      }
                   </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .student-app-page { padding: 60px 0; min-height: 100vh; color: var(--text-primary); }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 40px; }
        .page-header { margin-bottom: 60px; }
        .page-header h1 { font-size: 3.5rem; margin-bottom: 10px; }

        .empty-state-card { background: rgba(255,255,255,0.02); border: 1px solid #222; padding: 80px; text-align: center; border-radius: 12px; }
        .empty-state-card h2 { font-size: 2.5rem; margin-bottom: 20px; }
        .empty-state-card p { color: var(--text-secondary); margin-bottom: 40px; max-width: 500px; margin-inline: auto; }

        .app-layout { display: grid; grid-template-columns: 350px 1fr; gap: 40px; align-items: start; }
        .card { background: rgba(255,255,255,0.02); border: 1px solid #222; padding: 40px; border-radius: 12px; margin-bottom: 40px; }
        .card-title { margin-bottom: 24px; display: block; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .header-actions { display: flex; gap: 16px; }

        .status-pill { display: inline-block; padding: 8px 16px; border-radius: 100px; font-weight: 800; font-size: 0.7rem; margin-bottom: 20px; }
        .status-pill.lab_pending { background: rgba(0,209,255,0.1); color: #00D1FF; }
        .status-pill.hod_pending { background: rgba(168,85,247,0.1); color: #A855F7; }
        .status-pill.principal_pending { background: rgba(245,158,11,0.1); color: #F59E0B; }
        .status-pill.approved { background: rgba(16,185,129,0.1); color: #10B981; }
        .status-pill.rejected { background: rgba(239,68,68,0.1); color: #EF4444; }

        .docs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
        .doc-card { background: #0a0a0a; border: 1px solid #222; padding: 20px; border-radius: 8px; cursor: pointer; transition: all 0.3s; position: relative; }
        .doc-card:hover { border-color: #444; }
        .doc-card.selected { border-color: var(--accent-color); background: rgba(201,168,76,0.05); }
        .doc-card.readonly { cursor: default; opacity: 0.7; }
        .doc-type-icon { font-size: 0.6rem; font-weight: 800; color: #444; margin-bottom: 12px; }
        .doc-name { display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .checkbox { position: absolute; top: 15px; right: 15px; width: 20px; height: 20px; border: 1px solid #333; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
        .doc-card.selected .checkbox { background: var(--accent-color); border-color: var(--accent-color); }
        .check { color: #000; font-size: 0.7rem; font-weight: 900; }

        .attached-list { display: flex; flex-direction: column; gap: 12px; }
        .attached-item { display: flex; justify-content: space-between; align-items: center; background: #0f0f0f; padding: 12px 20px; border-radius: 4px; font-size: 0.9rem; }

        .primary-btn { background: var(--accent-color); color: #000; font-weight: 700; padding: 12px 24px; border-radius: 6px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .secondary-btn { background: transparent; color: white; border: 1px solid #333; padding: 12px 24px; border-radius: 6px; font-size: 0.8rem; }
        .primary-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .warning-text { color: #EF4444; font-size: 0.7rem; margin-top: 10px; font-weight: 600; text-transform: uppercase; }
        .error-banner { background: rgba(239,68,68,0.1); color: #EF4444; padding: 16px 20px; border-radius: 8px; margin-bottom: 40px; border: 1px solid rgba(239,68,68,0.2); font-size: 0.9rem; }
      ` }} />
    </div>
  )
}

export default StudentApplicationPage
