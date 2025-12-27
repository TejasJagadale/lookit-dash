import React, { useState } from 'react';

const Navbar = ({ isLoggedIn, currentUser, onLoginClick, onLogout, onMenuToggle }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          ☰
        </button>
        <div className="logo"> <a className='logoa' href='/Main-Category'> LookIt </a></div>
      </div>

      <div className="navbar-right">
        {isLoggedIn ? (
          <div className="profile-section">
            <button
              className="profile-button"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <img
                src={currentUser?.image || '/api/placeholder/40/40'}
                alt="Profile"
                className="profile-image"
              />
              <span>{currentUser?.name || 'User'}</span>
            </button>

            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="user-info">
                  <strong>{currentUser?.name || 'User'}</strong>
                  <br />
                  <small>{currentUser?.email || 'user@example.com'}</small>
                </div>
                <button className="logout-btn" onClick={onLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-btn" onClick={onLoginClick}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;