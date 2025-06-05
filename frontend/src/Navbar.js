import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; 
function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="logo">GYMNASIUM 7</h1>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/booking">Booking</Link></li>
        <li><Link to="/login"><u>Log in</u></Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
