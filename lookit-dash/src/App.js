import React, { useState, useEffect } from 'react';
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

  // Function to check if token is expired
  const checkTokenExpiry = (userData) => {
    if (!userData || !userData.loginTime) return false;
    
    const currentTime = Date.now();
    const hoursSinceLogin = (currentTime - userData.loginTime) / (1000 * 60 * 60);
    
    // Logout after 24 hours (you can adjust this)
    if (hoursSinceLogin > 24) {
      return false; // Token expired
    }
    
    return true; // Token is still valid
  };

  // Auto logout function
  const autoLogout = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (!checkTokenExpiry(user)) {
          handleLogout();
        }
      } catch (error) {
        console.error('Error checking login time:', error);
        handleLogout();
      }
    }
  };

  // Check for existing login on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedLogin = localStorage.getItem('isLoggedIn');
    
    if (storedUser && storedLogin === 'true') {
      try {
        const user = JSON.parse(storedUser);
        
        // Check if token is still valid
        if (checkTokenExpiry(user)) {
          setCurrentUser(user);
          setIsLoggedIn(true);
          setShowAuthModal(false);
        } else {
          // Token expired, logout
          localStorage.removeItem('currentUser');
          localStorage.removeItem('isLoggedIn');
          setShowAuthModal(true);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        setShowAuthModal(true);
      }
    } else {
      setShowAuthModal(true);
    }
  }, []);

  // Set up auto-logout interval
  useEffect(() => {
    // Run autoLogout immediately to check current session
    autoLogout();
    
    // Check every hour (3600000 ms = 1 hour)
    const interval = setInterval(autoLogout, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // When user logs in
  const handleLogin = (userData) => {
    const userWithTime = {
      ...userData,
      loginTime: Date.now() // Store login time
    };
    
    setIsLoggedIn(true);
    setCurrentUser(userWithTime);
    setShowAuthModal(false);
    
    // Store in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(userWithTime));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowAuthModal(true);
    
    // Clear localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
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

      {/* SHOW AUTH MODAL IF NOT LOGGED IN */}
      {showAuthModal && !isLoggedIn && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}

export default App;