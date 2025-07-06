import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import './Navbar.css';


const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">🐾 The Pawfect Match</Link>
      <div className="nav-links">
        {!user && (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
        {user && (
          <>
            <Link to="/account">Account</Link>
            <Link to="/matches">My Matches</Link>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
