import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  showHero?: boolean;
  heroTitle?: string;
  heroSubtitle?: string;
  heroActions?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showHero = false, 
  heroTitle, 
  heroSubtitle, 
  heroActions 
}) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Navigation - ugyanaz mint HomePage-en */}
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

      {/* Hero Section (opcionális) */}
      {showHero && (
        <div className="container py-20">
          <div className="text-center max-w-4xl" style={{margin: '0 auto'}}>
            {heroTitle && (
              <h1 className="text-4xl font-bold mb-6">
                {heroTitle}
              </h1>
            )}
            {heroSubtitle && (
              <p className="text-xl text-gray-600 mb-8">
                {heroSubtitle}
              </p>
            )}
            {heroActions && (
              <div className="flex gap-4 justify-center flex-wrap">
                {heroActions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={showHero ? '' : 'pt-4'}>
        {children}
      </main>

      {/* Footer - ugyanaz mint HomePage-en */}
      <footer style={{backgroundColor: '#1f2937', color: 'white', padding: '2rem 0', marginTop: '4rem'}}>
        <div className="container text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">🚀 Szolgáltató Piactér</h3>
              <p className="text-gray-300">
                Találd meg a tökéletes szolgáltatót minden igényedre.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Linkek</h4>
              <div className="space-y-2">
                <Link to="/services" className="block text-gray-300 hover:text-white">
                  Szolgáltatók böngészése
                </Link>
                <Link to="/register" className="block text-gray-300 hover:text-white">
                  Regisztráció
                </Link>
                {isAuthenticated && (
                  <Link to="/dashboard" className="block text-gray-300 hover:text-white">
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kapcsolat</h4>
              <div className="text-gray-300 space-y-2">
                <p>📧 info@szolgaltato-piacter.hu</p>
                <p>📞 +36 1 234 5678</p>
              </div>
            </div>
          </div>
          <hr className="border-gray-600 mb-4" />
          <p>&copy; 2024 Szolgáltató Piactér. Minden jog fenntartva.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;