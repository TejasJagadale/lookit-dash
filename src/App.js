import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MainContent from './components/MainContent';
import AuthModal from './components/AuthModal';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(true); // OPEN BY DEFAULT
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // When user logs in
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowAuthModal(true); // Re-open modal after logout
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="App">

      {/* SHOW DASHBOARD ONLY IF LOGGED IN */}
      {isLoggedIn && (
        <>
          <Navbar
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            onLogout={handleLogout}
            onMenuToggle={toggleSidebar}
          />

          <div className="dashboard-container">
            <Sidebar
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />

            <MainContent activeMenu={activeMenu} />
          </div>
        </>
      )}

      {/* ALWAYS SHOW AUTH MODAL IF NOT LOGGED IN */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}

export default App;
