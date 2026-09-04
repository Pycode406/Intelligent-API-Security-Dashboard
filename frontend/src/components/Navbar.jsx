import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Navbar.jsx
 * Reusable navigation bar shown on every page.
 */
export default function Navbar() {
  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <nav className="navbar">
      <div className="navbar-title">🛡️ API Security Dashboard</div>
      <div className="navbar-links">
        <NavLink to="/" className={linkClass} end>Home</NavLink>
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/bola" className={linkClass}>BOLA Test</NavLink>
        <NavLink to="/property-authorization" className={linkClass}>Property Test</NavLink>
        <NavLink to="/sensitive-data" className={linkClass}>Sensitive Data</NavLink>
        <NavLink to="/rate-limit" className={linkClass}>Rate Limit</NavLink>
        <NavLink to="/report" className={linkClass}>Report</NavLink>
      </div>
    </nav>
  );
}
