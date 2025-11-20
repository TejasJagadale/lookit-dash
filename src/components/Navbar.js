import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

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
        <li
          className={location.pathname === "/Lists" ? "active" : ""}
          onClick={closeMenu}
        >
          <Link to="/Lists">Lists</Link>
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
