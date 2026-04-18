import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ActivityStrip from './ActivityStrip';
import DashboardCard from './DashboardCard';
import AnimatedPipeline from './AnimatedPipeline';
import DocumentVault from './DocumentVault';

const StudentDashboard = () => {
  const [view, setView] = useState<'overview' | 'vault'>('overview');

  return (
    <div className="dashboard-container container">
      <AnimatePresence mode="wait">
        {view === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ActivityStrip statusCase={2} />
            </motion.div>

            <motion.div 
              className="dashboard-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <DashboardCard 
                label="FINANCES"
                title="Resolution Center"
                body="View and clear any flagged dues — library fines, lab charges, or hostel fees."
                status={
                  <div style={{ color: '#EF4444', fontWeight: 600 }}>2 dues pending · Total ₹680</div>
                }
                cta="Manage Payments →"
              />

              <DashboardCard 
                label="DOCUMENTS"
                title="Document Vault"
                body="Upload your required clearance documents — student ID, lab manual, and library receipt."
                status={
                  <div style={{ color: 'var(--text-secondary)' }}>Central repository for verification artifacts</div>
                }
                cta="Open Vault →"
                onClick={() => setView('vault')}
              />

              <DashboardCard 
                label="APPROVALS"
                title="Clearance Pipeline"
                body="Track your multi-stage approval progress across all departments."
                status={<AnimatedPipeline />}
                cta="View Full Pipeline →"
              />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="vault"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="vault-view-nav">
              <button onClick={() => setView('overview')} className="back-btn label">
                <ArrowLeft size={16} />
                <span>Back to Overview</span>
              </button>
            </div>
            <DocumentVault />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="footer" style={{ marginTop: 'auto', background: 'transparent', borderTop: '1px solid var(--border-color)', padding: '20px 0' }}>
        <div className="footer-container">
          <div className="footer-left label" style={{ fontSize: '0.6rem' }}>© 2025 NEXUS</div>
          <div className="footer-center label" style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
            Need help? Contact department admin.
          </div>
          <div className="footer-right label" style={{ fontSize: '0.6rem' }}>Built for students.</div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .vault-view-nav {
          padding: 20px 40px 0;
        }
        .back-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.3s ease;
          font-size: 0.7rem;
        }
        .back-btn:hover {
          color: var(--accent-color);
        }
      `}} />
    </div>
  );
};

export default StudentDashboard;
