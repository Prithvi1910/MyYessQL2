import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthority } from '../hooks/useAuthority';

const AuthorityLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signOut } = useAuthority();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { profile, error: signInError } = await signIn(email, password);

      if (signInError) throw signInError;

      if (profile) {
        if (profile.role === 'student') {
          setError('This portal is for authority users only.');
          await signOut();
          return;
        }
        
        navigate('/authority/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="label">Access Nexus</div>
          <h1 className="title">Staff Login</h1>
          <p className="subtitle">Secure Authority Administrative Portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="label">Staff Email</label>
            <input 
              type="email" 
              placeholder="name@nexus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="label">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="error-banner" style={{ 
              background: 'rgba(255, 77, 77, 0.1)', 
              border: '1px solid rgba(255, 77, 77, 0.2)',
              color: '#ff4d4d',
              padding: '12px',
              fontSize: '0.8rem',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary full-width"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>

          <div className="form-footer">
            <p>Need authority access? <span onClick={() => navigate('/authority/signup')}>Request Account</span></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthorityLogin;
