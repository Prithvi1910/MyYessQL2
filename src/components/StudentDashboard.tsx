import React from 'react';
import { motion } from 'framer-motion';
import ActivityStrip from './ActivityStrip';
import DashboardCard from './DashboardCard';
import AnimatedPipeline from './AnimatedPipeline';

const StudentDashboard = () => {
  return (
    <div className="dashboard-container container">

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
            <div style={{ color: 'var(--text-secondary)' }}>2 of 3 documents uploaded</div>
          }
          cta="Manage Documents →"
        />

        <DashboardCard 
          label="APPROVALS"
          title="Clearance Pipeline"
          body="Track your multi-stage approval progress across all departments."
          status={<AnimatedPipeline />}
          cta="View Full Pipeline →"
        />
      </motion.div>

      <footer className="footer" style={{ marginTop: 'auto', background: 'transparent', borderTop: '1px solid var(--border-color)', padding: '20px 0' }}>
        <div className="footer-container">
          <div className="footer-left label" style={{ fontSize: '0.6rem' }}>© 2025 NEXUS</div>
          <div className="footer-center label" style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
            Need help? Contact department admin.
          </div>
          <div className="footer-right label" style={{ fontSize: '0.6rem' }}>Built for students.</div>
        </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;
