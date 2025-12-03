import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MainContent from './components/MainContent';
import AuthModal from './components/AuthModal';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleSignUp = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    setShowAuthModal(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
   
  return (
    <div className="App">
      <Navbar
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onMenuToggle={toggleSidebar}
      />

      <div className="dashboard-container">
        <Sidebar
          isLoggedIn={isLoggedIn}
          onLoginClick={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <MainContent activeMenu={activeMenu} />
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
        />
      )}

    </div>

    
  );
}

export default App;