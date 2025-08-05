import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import './Navbar.css';

const Navbar = ({ user, isAdmin }) => {
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
    <div className="navbar-wrapper">
      <nav className="navbar">
        <Link to="/" className="nav-logo">🐾 The Pawfect Match</Link>
        <div className="nav-links">
          {!user ? (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </>
          ) : (
            <>
              <Link to="/account">Account</Link>
              <Link to="/matches">My Matches</Link>
              {/* {isAdmin && <Link to="/set-role">Admin Tools</Link>} */}
              {isAdmin && (
                    <>
                      <Link to="/admin">Admin Dashboard</Link>
                      <Link to="/set-role">Admin Tools</Link>
                    </>
                )}
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;


