import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Pipeline from './components/Pipeline';
import FeatureStack from './components/FeatureStack';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import InteractiveBackground from './components/InteractiveBackground';
import Footer from './components/Footer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; type: 'student' | 'authority' } | null>(null);

  const handleLogin = (type: 'student' | 'authority', userData: any) => {
    setIsAuthenticated(true);
    setUser({ name: userData.name, type });
    setIsAuthModalOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <div className="app">
      <InteractiveBackground />
      <div className="grain-overlay"></div>
      
      <Navbar 
        isAuthenticated={isAuthenticated} 
        onLogout={handleLogout}
        onLoginClick={openAuthModal}
        onRegisterClick={openAuthModal}
      />

      <main>
        {!isAuthenticated ? (
          <LandingPage onGetStarted={openAuthModal} />
        ) : (
          <>
            <Hero isAuthenticated={isAuthenticated} />
            <Pipeline />
            <FeatureStack />
          </>
        )}
      </main>

      {!isAuthenticated && <Footer />}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal} 
        onLogin={handleLogin} 
      />
    </div>
  );
}

export default App;
