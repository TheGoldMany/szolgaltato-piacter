import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar" style={{position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000}}>
      <div className="container flex justify-between items-center">
        <Link to="/" className="text-xl font-bold" style={{textDecoration: 'none', color: 'inherit'}}>
          🚀 Szolgáltató Piactér
        </Link>
        
        <div className="flex items-center gap-4">
          <span>
            {user?.firstName} {user?.lastName}
            {user?.userType === 'service_provider' && ' (Szolgáltató)'}
          </span>
          
          <div className="flex gap-2">
            <Link to="/dashboard" className="btn btn-outline">
              Dashboard
            </Link>
            <button onClick={logout} className="btn btn-secondary">
              Kijelentkezés
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;