import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  X, 
  AlertCircle, 
  Loader2, 
  File as FileIcon, 
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocumentVault } from '../hooks/useDocumentVault';
import type { Document } from '../types/document';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const DocumentVault: React.FC = () => {
  const { 
    documents, 
    isLoading, 
    uploadDocument, 
    downloadDocument, 
    deleteDocument, 
    error, 
    clearError 
  } = useDocumentVault();

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload PDF, JPEG, or PNG.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File exceeds 5MB limit.';
    }
    return null;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleFileUpload(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError(null);
    setUploading(true);
    setUploadProgress(0);

    // Simulate progress since Supabase JS v2 doesn't yet support progress natively for storage upload
    // using a simple interval for UI feedback
    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 100);

    try {
      await uploadDocument(file);
      setUploadProgress(100);
      setTimeout(() => setUploading(false), 500);
    } catch (err) {
      setUploading(false);
    } finally {
      clearInterval(interval);
    }
  };

  const SkeletonCard = () => (
    <div className="document-card skeleton">
      <div className="skeleton-thumb"></div>
      <div className="skeleton-info">
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
      </div>
    </div>
  );

  return (
    <div className="document-vault">
      <header className="vault-header">
        <div className="header-text">
          <h2 className="serif">Document Vault</h2>
          <p className="label">Verification Artifacts</p>
        </div>
      </header>

      {/* Error Banners */}
      <AnimatePresence>
        {(error || localError) && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="error-banner"
          >
            <div className="error-content">
              <AlertCircle size={18} />
              <span>{localError || error}</span>
            </div>
            <button onClick={() => { clearError(); setLocalError(null); }} className="close-btn">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="vault-content">
        {/* Upload Zone */}
        <div 
          className={`upload-zone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden-input"
          />
          
          <div className="upload-icon-wrap">
            {uploading ? (
              <Loader2 className="spinner" size={40} />
            ) : (
              <Upload size={40} />
            )}
          </div>

          <div className="upload-text">
            {uploading ? (
              <>
                <h3>Uploading Document...</h3>
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p>{uploadProgress}% Complete</p>
              </>
            ) : (
              <>
                <h3>Drop documents here</h3>
                <p>or click to browse specialized files</p>
                <span className="file-infoLabel">PDF, JPEG, PNG (Max 5MB)</span>
              </>
            )}
          </div>
        </div>

        {/* Document Grid */}
        <div className="vault-grid-section">
          <div className="grid-header">
            <h3>Stored Documents</h3>
            <span className="doc-count">{documents.length} Files</span>
          </div>

          <div className="document-grid">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : documents.length > 0 ? (
              documents.map((doc) => (
                <motion.div 
                  layout
                  key={doc.id}
                  className="document-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="card-media" onClick={() => setSelectedDoc(doc)}>
                    <div className="media-overlay">
                      <Eye size={24} />
                      <span>Preview</span>
                    </div>
                    {doc.file_type === 'PDF' ? (
                      <div className="pdf-thumb">
                        <FileText size={48} />
                      </div>
                    ) : (
                      <img src={doc.file_url} alt={doc.file_name} className="image-thumb" />
                    )}
                  </div>

                  <div className="card-info">
                    <div className="info-main">
                      <span className={`type-badge ${doc.file_type.toLowerCase()}`}>
                        {doc.file_type}
                      </span>
                      <h4 title={doc.file_name}>{doc.file_name}</h4>
                      <p className="date">{new Date(doc.uploaded_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</p>
                    </div>

                    <div className="card-actions">
                      <button 
                        className="action-btn download" 
                        onClick={() => downloadDocument(doc)}
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => deleteDocument(doc)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="empty-state">
                <FileIcon size={48} opacity={0.2} />
                <p>No documents uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal - Document Preview */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div 
            className="vault-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div 
              className={`vault-modal-content ${selectedDoc.file_type === 'PDF' ? 'pdf-view' : 'img-view'}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <header className="modal-header">
                <div className="modal-info">
                  <h3 className="serif">{selectedDoc.file_name}</h3>
                  <span className="label">{selectedDoc.file_type} Document</span>
                </div>
                <div className="modal-actions">
                  <button className="action-btn" onClick={() => downloadDocument(selectedDoc)}>
                    <Download size={20} />
                  </button>
                  <button className="close-btn" onClick={() => setSelectedDoc(null)}>
                    <X size={24} />
                  </button>
                </div>
              </header>

              <div className="modal-body">
                {selectedDoc.file_type === 'PDF' ? (
                  <iframe 
                    src={`${selectedDoc.file_url}#toolbar=0`} 
                    title={selectedDoc.file_name}
                    className="pdf-iframe"
                  />
                ) : (
                  <img src={selectedDoc.file_url} alt={selectedDoc.file_name} className="img-full" />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .document-vault {
          padding: 40px;
          color: var(--text-primary);
        }

        .vault-header {
          margin-bottom: 40px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
        }

        .vault-header h2 {
          font-size: 2.5rem;
          margin-bottom: 4px;
        }

        .error-banner {
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.2);
          padding: 12px 20px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #ef4444;
          font-size: 0.9rem;
        }

        .error-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .upload-zone {
          border: 1px dashed var(--border-color);
          background: rgba(255, 255, 255, 0.02);
          padding: 60px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 60px;
          position: relative;
          overflow: hidden;
        }

        .upload-zone:hover, .upload-zone.dragging {
          border-color: var(--accent-color);
          background: rgba(201, 168, 76, 0.05);
        }

        .upload-zone.uploading {
          cursor: default;
        }

        .upload-icon-wrap {
          color: var(--accent-color);
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .upload-text h3 {
          font-family: 'Newsreader', serif;
          font-size: 1.5rem;
          margin-bottom: 8px;
        }

        .upload-text p {
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .file-infoLabel {
          font-size: 0.7rem;
          color: #444;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .progress-container {
          width: 100%;
          max-width: 300px;
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          margin: 20px auto 10px;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: var(--accent-color);
          transition: width 0.3s ease;
        }

        .hidden-input {
          display: none;
        }

        .grid-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 30px;
        }

        .grid-header h3 {
          font-family: 'Newsreader', serif;
          font-size: 1.8rem;
        }

        .doc-count {
          color: var(--text-secondary);
          font-size: 0.8rem;
          letter-spacing: 0.1em;
        }

        .document-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 30px;
        }

        .document-card {
          background: #0d0d0d;
          border: 1px solid var(--border-color);
          transition: transform 0.3s ease, border-color 0.3s ease;
          overflow: hidden;
        }

        .document-card:hover {
          transform: translateY(-5px);
          border-color: rgba(201, 168, 76, 0.3);
        }

        .card-media {
          height: 180px;
          background: #151515;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-in;
          overflow: hidden;
        }

        .media-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 2;
        }

        .media-overlay span {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .card-media:hover .media-overlay {
          opacity: 1;
        }

        .pdf-thumb {
          color: #ef4444;
          opacity: 0.6;
        }

        .image-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-info {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
        }

        .info-main {
          flex: 1;
          min-width: 0;
        }

        .type-badge {
          display: inline-block;
          font-size: 0.6rem;
          padding: 2px 8px;
          border-radius: 2px;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .type-badge.pdf { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .type-badge.image { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

        .info-main h4 {
          font-size: 1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }

        .date {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .action-btn:hover {
          color: var(--text-primary);
          border-color: var(--text-secondary);
        }

        .action-btn.delete:hover {
          color: #ef4444;
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }

        /* Modal Styles */
        .vault-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          backdrop-filter: blur(10px);
        }

        .vault-modal-content {
          background: #080808;
          border: 1px solid var(--border-color);
          width: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .vault-modal-content.pdf-view {
          max-width: 1000px;
          height: 90vh;
        }

        .vault-modal-content.img-view {
          max-width: 800px;
          max-height: 90vh;
        }

        .modal-header {
          padding: 20px 30px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-info h3 {
          font-size: 1.5rem;
          margin-bottom: 4px;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .modal-body {
          flex: 1;
          overflow: hidden;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pdf-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .img-full {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .close-btn:hover {
          color: #fff;
        }

        .empty-state {
          grid-column: 1 / -1;
          padding: 100px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.01);
          border: 1px dashed var(--border-color);
        }

        /* Skeleton */
        .document-card.skeleton .skeleton-thumb {
          height: 180px;
          background: rgba(255, 255, 255, 0.03);
          position: relative;
          overflow: hidden;
        }

        .document-card.skeleton .skeleton-line {
          height: 12px;
          background: rgba(255, 255, 255, 0.03);
          margin-bottom: 10px;
          border-radius: 2px;
        }

        .document-card.skeleton .skeleton-line.short {
          width: 60%;
        }

        .document-card.skeleton .skeleton-thumb::after,
        .document-card.skeleton .skeleton-line::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @media (max-width: 768px) {
          .document-vault { padding: 20px; }
          .upload-zone { padding: 40px 20px; }
          .vault-modal-overlay { padding: 0; }
          .vault-modal-content { height: 100vh; max-height: 100vh; border: none; }
        }
      `}} />
    </div>
  );
};

export default DocumentVault;
