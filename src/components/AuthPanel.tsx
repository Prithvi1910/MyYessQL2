import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPanel = () => {
  const [activeTab, setActiveTab] = useState('student');

  return (
    <section className="auth">
      <div className="container">
        <div className="auth-grid">
          <div className="auth-description">
            <span className="label" style={{ color: 'var(--accent-color)' }}>Access Rights</span>
            <h2 className="serif title">Sovereign<br/>Entry</h2>
            <p className="desc">
              Connect your decentralized academic identity to the Nexus network. 
              Authenticity verified by the university ledger.
            </p>
          </div>

          <div className="auth-card">
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${activeTab === 'student' ? 'active' : ''}`}
                onClick={() => setActiveTab('student')}
              >
                Student
              </button>
              <button 
                className={`auth-tab ${activeTab === 'authority' ? 'active' : ''}`}
                onClick={() => setActiveTab('authority')}
              >
                Authority
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="auth-form"
              >
                <div className="input-group">
                  <label className="label">Identity Number</label>
                  <input type="text" placeholder={activeTab === 'student' ? "STU-000000" : "AUTH-000000"} />
                </div>
                <div className="input-group">
                  <label className="label">Access Key</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <button className="btn-primary full-width">
                  {activeTab === 'student' ? 'Establish Connection' : 'Administrative Entry'}
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthPanel;
