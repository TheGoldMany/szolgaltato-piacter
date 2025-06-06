import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container flex justify-between items-center">
          <div className="text-xl font-bold">
            🚀 Szolgáltató Piactér
          </div>
          
          <div className="flex gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span>Üdv, {user?.firstName}!</span>
                <Link to="/dashboard" className="btn btn-primary">
                  Dashboard
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

      {/* Hero Section */}
      <div className="container py-20">
        <div className="text-center max-w-4xl" style={{margin: '0 auto'}}>
          <h1 className="text-4xl font-bold mb-6">
            Találd meg a tökéletes szolgáltatót!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Egy helyen minden szakember - villanyszerelőtől grafikusig. 
            Modulárisan testreszabható profilok, megbízható értékelések.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
              Kezdjük el! 🚀
            </Link>
            <button className="btn btn-outline text-lg px-8 py-3">
              Szolgáltatók böngészése
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-12">
            Miért választd a platformunkat?
          </h2>
          
          <div className="grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div className="card text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Moduláris Profilok</h3>
              <p className="text-gray-600">
                Drag-and-drop szerkesztővel személyre szabható szolgáltatói oldalak
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Okos Keresés</h3>
              <p className="text-gray-600">
                Gyors és pontos keresés kategóriák, ár és helyszín alapján
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">Megbízható Értékelések</h3>
              <p className="text-gray-600">
                Valós ügyfél vélemények és tanúsítvány alapú hitelesítés
              </p>
            </div>
          </div>
        </div>

        {/* Categories Preview */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-12">
            Népszerű kategóriák
          </h2>
          
          <div className="grid" style={{
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {[
              { icon: '🏗️', name: 'Építőipar', count: '234 szolgáltató' },
              { icon: '🎨', name: 'Kreatív & Design', count: '156 szolgáltató' },
              { icon: '💻', name: 'IT & Fejlesztés', count: '189 szolgáltató' },
              { icon: '📚', name: 'Oktatás', count: '98 szolgáltató' },
              { icon: '🌱', name: 'Kert & Háztartás', count: '145 szolgáltató' },
              { icon: '⚖️', name: 'Jogi & Pénzügyi', count: '67 szolgáltató' }
            ].map((category, index) => (
              <div key={index} className="card text-center" style={{cursor: 'pointer'}}>
                <div className="text-3xl mb-2">{category.icon}</div>
                <h4 className="font-semibold">{category.name}</h4>
                <p className="text-sm text-gray-600">{category.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{backgroundColor: '#1f2937', color: 'white', padding: '2rem 0', marginTop: '4rem'}}>
        <div className="container text-center">
          <p>&copy; 2024 Szolgáltató Piactér. Minden jog fenntartva.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;