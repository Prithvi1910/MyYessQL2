import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  isOpen: boolean;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType] = useState<'student' | 'lab' | 'hod' | 'principal' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentUid, setStudentUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
              student_uid: userType === 'student' ? studentUid : null,
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
                <span className="label" style={{ color: 'var(--accent-color)' }}>Nexus Login</span>
                <h1 className="serif title">{isLogin ? 'Establish Connection' : 'Register Identity'}</h1>
              </div>

              <div className="form-switcher">
                <button 
                  className={`switch-btn ${isLogin ? 'active' : ''}`}
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
                <button 
                  className={`switch-btn ${!isLogin ? 'active' : ''}`}
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </button>
              </div>

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

                      {!isLogin && userType === 'student' && (
                        <div className="input-group wide">
                          <label className="label">Student UID (10 digits)</label>
                          <input 
                            type="text" 
                            placeholder="1234567890" 
                            required 
                            pattern="\d{10}"
                            title="Please enter a 10-digit UID"
                            value={studentUid}
                            onChange={(e) => setStudentUid(e.target.value.replace(/\D/g, '').slice(0, 10))}
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
                          {isLogin ? " Sign Up" : " Establish Connection"}
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
