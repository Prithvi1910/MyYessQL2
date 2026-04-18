import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import InteractiveBackground from './components/InteractiveBackground';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  if (loading) {
    return (
      <div className="loading-screen">
        <InteractiveBackground />
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="app">
      <InteractiveBackground />
      <div className="grain-overlay"></div>
      
      <Navbar 
        onLoginClick={openAuthModal}
        onRegisterClick={openAuthModal}
        studentName={user?.name}
      />

      <main>
        <Routes>
          <Route path="/" element={
            !user ? (
              <LandingPage onGetStarted={openAuthModal} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <>
                <Hero isAuthenticated={true} />
                <Pipeline />
                <FeatureStack />
              </>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="admin-dashboard">
                <h1>Admin Dashboard</h1>
                <p>Welcome, administrator. Here you can manage the application.</p>
                {/* Admin specific components will go here */}
              </div>
            </ProtectedRoute>
          } />

          <Route path="/unauthorized" element={
            <div className="error-page">
              <h1>Unauthorized Access</h1>
              <p>You do not have permission to view this page.</p>
            </div>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!user && <Footer />}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal} 
      />
    </div>
  );
}

export default App;
