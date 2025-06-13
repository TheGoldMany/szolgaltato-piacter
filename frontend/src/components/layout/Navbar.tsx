import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="navbar">
      <div className="container flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          🚀 Szolgáltató Piactér
        </Link>
        
        <div className="flex gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span>Üdv, {user?.firstName}!</span>
              <Link to="/dashboard" className="btn btn-primary">
                Dashboard
              </Link>
              <Link to="/profile/edit" className="btn btn-outline">
                Profil szerkesztése
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Bejelentkezés
              </Link>
              <Link to="/register" className="btn btn-primary">
                Regisztráció
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;