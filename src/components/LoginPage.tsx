import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginPageProps {
  onLogin: (userType: 'student' | 'authority', userData: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'student' | 'authority'>('student');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth success
    onLogin(userType, { name: "John Doe", id: userType === 'student' ? 'STU-123' : 'AUTH-123' });
  };

  return (
    <div className="login-page">
      <div className="grain-overlay"></div>
      
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-header">
          <span className="label" style={{ color: 'var(--accent-color)' }}>Nexus Network</span>
          <h1 className="serif title">{isLogin ? 'Establish Connection' : 'Register Identity'}</h1>
          <p className="subtitle">AUTHENTICITY VERIFIED BY THE UNIVERSITY LEDGER</p>
        </div>

        <div className="form-switcher">
          <button 
            className={`switch-btn ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Entry
          </button>
          <button 
            className={`switch-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Inscription
          </button>
        </div>

        <div className="auth-type-toggle">
          <button 
            className={`type-btn ${userType === 'student' ? 'active' : ''}`}
            onClick={() => setUserType('student')}
          >
            Student
          </button>
          <button 
            className={`type-btn ${userType === 'authority' ? 'active' : ''}`}
            onClick={() => setUserType('authority')}
          >
            Authority
          </button>
        </div>

        <form onSubmit={handleAuth}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${isLogin}-${userType}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="signup-grid">
                {!isLogin && (
                  <div className="input-group wide">
                    <label className="label">Full Legal Name</label>
                    <input type="text" placeholder="Johnathan Doe" required />
                  </div>
                )}

                <div className={`input-group ${isLogin ? 'wide' : ''}`}>
                  <label className="label">{userType === 'student' ? 'Student ID' : 'Authority ID'}</label>
                  <input type="text" placeholder={userType === 'student' ? "STU-000000" : "AUTH-000000"} required />
                </div>

                {!isLogin && (
                  <>
                    <div className="input-group">
                      <label className="label">Department</label>
                      <input type="text" placeholder="Computer Science" required />
                    </div>
                    {userType === 'student' && (
                      <>
                        <div className="input-group">
                          <label className="label">Course</label>
                          <input type="text" placeholder="B.Tech" required />
                        </div>
                        <div className="input-group">
                          <label className="label">Year of Study</label>
                          <input type="text" placeholder="Year 3" required />
                        </div>
                      </>
                    )}
                  </>
                )}

                {!isLogin && (
                  <div className="input-group wide">
                    <label className="label">Academic Email</label>
                    <input type="email" placeholder="john.doe@university.edu" required />
                  </div>
                )}

                <div className="input-group wide">
                  <label className="label">Access Key</label>
                  <input type="password" placeholder="••••••••" required />
                </div>
              </div>

              <div className="form-footer">
                <button className="btn-primary full-width" type="submit">
                  {isLogin ? 'Request Access' : 'Initialize Identity'}
                </button>
                <p>
                  {isLogin ? "New to the network?" : "Already verified?"} 
                  <span onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? " Request Inscription" : " Establish Connection"}
                  </span>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
