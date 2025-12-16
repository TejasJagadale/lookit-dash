import React, { useState } from 'react';
import "../styles/Sidebar.css"

const Sidebar = ({ isLoggedIn, onLoginClick, onLogout, activeMenu, setActiveMenu, isOpen, onClose }) => {
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      name: 'LookIt Categories',
      submenus: ['Main-Category', 'sub-Category'],
      icon: '/assets/article.png'
    },
    {
      name: 'ReadersMenu Categories',
      submenus: ['MainCategoryRm'],
      icon: '/assets/article.png'
    },
    {
      name: 'Lookit Articles',
      submenus: ['Add Article', 'List & Edit Articles'],
      icon: '/assets/article.png'
    },
    {
      name: 'ReadersMenu Articles',
      submenus: ['Add Article', 'List and Edit Articles'],
      icon: '/assets/article.png' 
    },
    {
      name: 'Notifications',
      submenus: [],
      icon: '/assets/bell.png'
    },
    {
      name: 'Schedule',
      submenus: [],
      icon: '/assets/calendar.png'
    },
    {
      name: 'Astrology',
      submenus: ['Rasi Upload Form', 'RasiList'],
      icon: '/assets/astrology.png'
    },
    {
      name: 'Banner',
      submenus: [],
      icon: '/assets/astrology.png'
    }
  ];

  const handleMenuClick = (item, submenu = null) => {
    const menuToSet = submenu || item.name;
    setActiveMenu(menuToSet);
    if (isOpen) onClose(); // Close sidebar on mobile after selection
  };

  const handleIconHover = (itemName) => {
    setHoveredMenu(itemName);
  };

  const handleIconLeave = () => {
    setHoveredMenu(null);
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>

        {/* Sidebar Header */}
        <div className="sidebar-header">
          {!isCollapsed && (
            <div className="sidebar-brand">
              <span className="brand-icon"><img alt='' className='sideicon' src='/assets/dashboard.png' /></span>
              <span className="brand-text">Dashboard</span>
            </div>
          )}

          {!isCollapsed && (
            <div className="sidebar-controls">
              <button
                className="toggle-btn"
                onClick={toggleSidebar}
                title="Collapse sidebar"
              >
                <img alt='' src='/assets/left.png' className='sideicon' />
              </button>
            </div>
          )}
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <div className="expand-section">
            <button
              className="expand-btn"
              onClick={toggleSidebar}
              title="Expand sidebar"
            >
              <img alt='' src='/assets/right.png' className='sideicon' />
            </button>
          </div>
        )}

        {/* Navigation Menu - Show full menu when not collapsed */}
        {!isCollapsed ? (
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.name} className="menu-item">
                <div
                  className={`menu-title ${activeMenu === item.name ? 'active' : ''}`}
                  onClick={() => {
                    if (item.submenus && item.submenus.length > 0) {
                      toggleSubmenu(item.name);
                    } else {
                      handleMenuClick(item);
                    }
                  }}
                >
                  <div className="menu-content">
                    <span className="menu-icon"> <img alt='' className='sideicon' src={item.icon} /> </span>
                    <span className="menu-text">{item.name}</span>
                    {item.submenus && item.submenus.length > 0 && (
                      <span className="menu-arrow">
                        {openSubmenus[item.name] ? '▾' : '▸'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Submenu */}
                {item.submenus && item.submenus.length > 0 && (
                  <ul className={`submenu ${openSubmenus[item.name] ? 'open' : ''}`}>
                    {item.submenus.map((submenu) => (
                      <li
                        key={submenu}
                        className={`submenu-item ${activeMenu === submenu ? 'active' : ''}`}
                        onClick={() => handleMenuClick(item, submenu)}
                      >
                        <span className="submenu-icon">•</span>
                        <span className="submenu-text">{submenu}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          /* Show only icons when collapsed with submenu popouts */
          <div className="sidebar-icons">
            {menuItems.map(item => (
              <div
                key={item.name}
                className={`icon-container ${activeMenu === item.name || item.submenus?.includes(activeMenu) ? 'active' : ''}`}
                onMouseEnter={() => handleIconHover(item.name)}
                onMouseLeave={handleIconLeave}
              >
                <div
                  className="icon-item"
                  onClick={() => {
                    if (item.submenus && item.submenus.length > 0) {
                      // For items with submenus, toggle the popout on click for mobile
                      if (window.innerWidth <= 768) {
                        setHoveredMenu(hoveredMenu === item.name ? null : item.name);
                      }
                    } else {
                      handleMenuClick(item);
                    }
                  }}
                  title={item.submenus && item.submenus.length > 0 ? `${item.name} (Has submenus)` : item.name}
                >
                  <span className="icon"><img alt='' className='sideicon' src={item.icon} /> </span>
                  {item.submenus && item.submenus.length > 0 && (
                    <span className="submenu-indicator">•</span>
                  )}
                </div>

                {/* Submenu Popout */}
                {hoveredMenu === item.name && item.submenus && item.submenus.length > 0 && (
                  <div className="submenu-popout">
                    <div className="popout-header">
                      <span className="popout-icon"><img alt='' className='sideicon' src={item.icon} /> </span>
                      <span className="popout-title">{item.name}</span>
                    </div>
                    <div className="popout-items">
                      {item.submenus.map((submenu) => (
                        <div
                          key={submenu}
                          className={`popout-item ${activeMenu === submenu ? 'active' : ''}`}
                          onClick={() => handleMenuClick(item, submenu)}
                        >
                          {submenu}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Auth Section */}
        <div className="sidebar-auth">
          {!isLoggedIn ? (
            <button className="auth-btn login-btn" onClick={onLoginClick}>
              <span className="auth-icon"><img alt='' className='sideicon' src='/assets/man.png' /></span>
              {!isCollapsed && <span>Sign Up / Login</span>}
            </button>
          ) : (
            <button className="auth-btn logout-btn" onClick={onLogout}>
              <span className="auth-icon">🚪</span>
              {!isCollapsed && <span>Logout</span>}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;