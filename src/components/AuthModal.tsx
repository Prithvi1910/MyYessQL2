import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  isOpen: boolean;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'student' | 'lab' | 'hod' | 'principal' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: userType,
            },
          },
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          <motion.div 
            className="modal-overlay-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
          />
          
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="login-card">
              <button 
                onClick={onClose} 
                style={{ position: 'absolute', top: 20, right: 20, color: 'var(--text-secondary)', fontSize: '1.5rem', zIndex: 10 }}
              >
                ×
              </button>

              <div className="login-header">
                <span className="label" style={{ color: 'var(--accent-color)' }}>Nexus Entry</span>
                <h1 className="serif title">{isLogin ? 'Establish Connection' : 'Register Identity'}</h1>
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
                  className={`type-btn ${userType !== 'student' ? 'active' : ''}`}
                  onClick={() => setUserType('admin')}
                >
                  Authority
                </button>
              </div>

              {!isLogin && userType !== 'student' && (
                <div className="input-group wide" style={{ marginBottom: '1.5rem' }}>
                  <label className="label">Authority Type</label>
                  <select 
                    value={userType} 
                    onChange={(e) => setUserType(e.target.value as any)}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      background: 'var(--surface-color)', 
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="admin">System Admin</option>
                    <option value="lab">Lab Authority</option>
                    <option value="hod">HOD</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>
              )}

              {error && (
                <div style={{ color: '#ff4444', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}

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
                          <input 
                            type="text" 
                            placeholder="Johnathan Doe" 
                            required 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>
                      )}

                      <div className="input-group wide">
                        <label className="label">Email Address</label>
                        <input 
                          type="email" 
                          placeholder="name@university.edu" 
                          required 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="input-group wide">
                        <label className="label">Access Key</label>
                        <input 
                          type="password" 
                          placeholder="••••••••" 
                          required 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-footer">
                      <button className="btn-primary full-width" type="submit" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Request Access' : 'Initialize Identity')}
                      </button>
                      <p>
                        {isLogin ? "New to the network?" : "Already verified?"} 
                        <span onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', color: 'var(--accent-color)' }}>
                          {isLogin ? " Request Inscription" : " Establish Connection"}
                        </span>
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
