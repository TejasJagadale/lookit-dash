import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <nav className="navbar">
      <div className="nav-logo">Lookit</div>

      {/* Hamburger Icon */}
      <div
        className={`hamburger ${menuOpen ? "active" : ""}`}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Navigation Links */}
      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        <li
          className={location.pathname === "/" ? "active" : ""}
          onClick={closeMenu}
        >
          <Link to="/">Main-Category</Link>
        </li>

        <li
          className={location.pathname === "/Sub-Category" ? "active" : ""}
          onClick={closeMenu}
        >
          <Link to="/Sub-Category">Sub-Category</Link>
        </li>

        {/* DROPDOWN MENU */}
        <li className="dropdown">
          <div className="dropdown-btn" onClick={toggleDropdown}>
            Article ▼
          </div>

          <ul className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}>
            <li onClick={closeMenu}>
              <Link to="/upload-article">Add Article</Link>
            </li>
            <li onClick={closeMenu}>
              <Link to="/Lists">List</Link>
            </li>
            <li onClick={closeMenu}>
              <Link to="/list-all">List & Edit Articles</Link>
            </li>
          </ul>
        </li>

        <li
          className={location.pathname === "/notifications" ? "active" : ""}
          onClick={closeMenu}
        >
          <Link to="/notifications">Notifications</Link>
        </li>

        <li
          className={location.pathname === "/schedule" ? "active" : ""}
          onClick={closeMenu}
        >
          <Link to="/schedule">Schedule</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
