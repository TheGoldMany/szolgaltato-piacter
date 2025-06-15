import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock Auth Context (helyettesíti a useAuth-ot)
const useAuth = () => {
  return {
    user: {
      firstName: 'János',
      lastName: 'Kovács',
      userType: 'service_provider' // vagy 'customer'
    }
  };
};

// Navbar komponens (ugyanaz mint HomePage-ben)
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const navLinks = [
    { href: '/', label: 'Főoldal', icon: '🏠' },
    { href: '/services', label: 'Szolgáltatók', icon: '🔍' },
    { href: '/categories', label: 'Kategóriák', icon: '📋' },
    { href: '/how-it-works', label: 'Hogyan működik', icon: '❓' },
  ];

  const userMenuItems = user ? [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/profile/edit', label: 'Profil szerkesztése', icon: '👤' },
    { href: '/profile/modular-editor', label: 'Moduláris szerkesztő', icon: '🎨', highlight: true },
    { href: '/messages', label: 'Üzenetek', icon: '💬' },
    { href: '/orders', label: 'Megrendelések', icon: '📦' },
    { href: '/settings', label: 'Beállítások', icon: '⚙️' },
    { href: '/logout', label: 'Kijelentkezés', icon: '🚪' },
  ] : [];

  return (
    <nav className="navbar-fixed">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🎯</span>
              </div>
              <span className="logo-text">
                Corvus
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link"
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500">
                    {user.userType === 'service_provider' ? 'Szolgáltató' : 'Ügyfél'}
                  </p>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-menu md:hidden py-4">
            <div className="space-y-2 px-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg px-3 transition-colors"
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </a>
              ))}
              
              {userMenuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 py-3 px-3 rounded-lg transition-colors ${
                    item.highlight 
                      ? 'text-blue-600 bg-blue-50 font-medium' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      ÚJ
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 navbar-padding">
      <Navbar />

      {/* Welcome Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Üdvözöllek, {user?.firstName}! 👋
            </h1>
            <p className="text-xl text-blue-100">
              {user?.userType === 'service_provider' 
                ? 'Kezeld szolgáltatásaidat és projektjeidet egyszerűen'
                : 'Találd meg a tökéletes szolgáltatót minden igényedre'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats - csak service provider-nek */}
      {user?.userType === 'service_provider' && (
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">156</div>
                <p className="text-sm text-blue-700">Profil megtekintés</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">23</div>
                <p className="text-sm text-green-700">Új üzenet</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">89%</div>
                <p className="text-sm text-purple-700">Profil teljesség</p>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">4.8</div>
                <p className="text-sm text-amber-700">Átlag értékelés</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Dashboard Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Service Provider Dashboard */}
          {user?.userType === 'service_provider' ? (
            <>
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">📊 Szolgáltató Dashboard</h2>
                <p className="text-lg text-gray-600">Minden, amire szükséged van egy helyen</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                
                {/* Profil kezelése */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-blue-300 group">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">👤</div>
                    <h3 className="text-xl font-semibold">Profil kezelése</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Szerkeszd profilodat és szolgáltatásaidat
                  </p>
                  <div className="space-y-3">
                    <Link 
                      to="/profile/edit" 
                      className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      📝 Alap profil szerkesztése
                    </Link>
                    <Link 
                      to="/profile/modular-editor" 
                      className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      🎨 Moduláris szerkesztő
                    </Link>
                  </div>
                </div>

                {/* Üzenetek */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-blue-300 group">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">💬</div>
                    <h3 className="text-xl font-semibold">Üzenetek</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    3 új üzenet várja válaszod
                  </p>
                  <button className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                    Üzenetek megtekintése
                  </button>
                </div>

                {/* Galéria */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-blue-300 group">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">📸</div>
                    <h3 className="text-xl font-semibold">Galéria</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Töltsd fel munkáid képeit és videóit
                  </p>
                  <button className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                    Képek feltöltése
                  </button>
                </div>

                {/* Szolgáltatások */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-blue-300 group">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">📋</div>
                    <h3 className="text-xl font-semibold">Szolgáltatások</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Kezeld szolgáltatásaidat és árajdat
                  </p>
                  <button className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                    Szolgáltatások kezelése
                  </button>
                </div>

                {/* Pénzügyek */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-blue-300 group">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">💰</div>
                    <h3 className="text-xl font-semibold">Pénzügyek</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Bevételek és kifizetések követése
                  </p>
                  <button className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                    Pénzügyek megtekintése
                  </button>
                </div>

                {/* Corvus Képzések */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-blue-300 group">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">🎓</div>
                    <h3 className="text-xl font-semibold">Corvus Képzések</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Szakmai fejlődés és tanúsítványok
                  </p>
                  <button className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                    Képzések böngészése
                  </button>
                </div>
              </div>

              {/* Gyors műveletek */}
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-6">🚀 Gyors műveletek</h3>
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/profile/edit" 
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                    📝 Alap profil
                  </Link>
                  <Link 
                    to="/profile/modular-editor" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🎨 Moduláris szerkesztő
                  </Link>
                  <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                    📸 Képek feltöltése
                  </button>
                  <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                    💼 Új szolgáltatás hozzáadása
                  </button>
                  <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    📊 Statisztikák megtekintése
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Customer Dashboard */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">👤 Ügyfél Dashboard</h2>
                <p className="text-lg text-gray-600">Kezdd el a szolgáltatók keresését</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                
                {/* Keresés */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-blue-300 group">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">🔍</div>
                    <h3 className="text-xl font-semibold">Keresés</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Találd meg a tökéletes szolgáltatót
                  </p>
                  <Link 
                    to="/services" 
                    className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Szolgáltatók böngészése
                  </Link>
                </div>

                {/* Kedvencek */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-blue-300 group">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">⭐</div>
                    <h3 className="text-xl font-semibold">Kedvencek</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Még nincsenek kedvenc szolgáltatóid
                  </p>
                  <button className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                    Kedvencek kezelése
                  </button>
                </div>

                {/* Projektjeim */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-blue-300 group">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">📋</div>
                    <h3 className="text-xl font-semibold">Projektjeim</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Nincs aktív projected
                  </p>
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Projekt indítása
                  </button>
                </div>

                {/* Üzenetek */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-blue-300 group">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">💬</div>
                    <h3 className="text-xl font-semibold">Üzenetek</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Nincs új üzeneted
                  </p>
                  <button className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                    Beszélgetések
                  </button>
                </div>

                {/* Corvus Képzések */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-blue-300 group">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">🎓</div>
                    <h3 className="text-xl font-semibold">Corvus Képzések</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Tanulj új készségeket
                  </p>
                  <button className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                    Képzések böngészése
                  </button>
                </div>

                {/* AI Tanácsadó */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-blue-300 group">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">🤖</div>
                    <h3 className="text-xl font-semibold">AI Tanácsadó</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Kérdezd meg az AI-t a problémádról
                  </p>
                  <button className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                    AI Chat indítása
                  </button>
                </div>
              </div>

              {/* Ajánlott kategóriák */}
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-6">🔥 Ajánlott neked</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition-all duration-300 group">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏗️</div>
                    <h4 className="font-semibold mb-2">Építés & Felújítás</h4>
                    <p className="text-sm text-gray-600 mb-4">234 szakember</p>
                    <Link 
                      to="/services?category=epites-felujitas" 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Böngészés
                    </Link>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-lg transition-all duration-300 group">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💻</div>
                    <h4 className="font-semibold mb-2">IT & Fejlesztés</h4>
                    <p className="text-sm text-gray-600 mb-4">189 szakember</p>
                    <Link 
                      to="/services?category=it-technologia" 
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Böngészés
                    </Link>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-lg transition-all duration-300 group">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎨</div>
                    <h4 className="font-semibold mb-2">Kreatív & Design</h4>
                    <p className="text-sm text-gray-600 mb-4">156 szakember</p>
                    <Link 
                      to="/services?category=grafikai-tervezes" 
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Böngészés
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">🚀 Corvus Platform</div>
              <p className="text-gray-400">
                Találd meg a tökéletes szakembert minden igényedre.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/services" className="hover:text-white transition-colors">Szolgáltatók böngészése</a></li>
                <li><a href="/register" className="hover:text-white transition-colors">Regisztráció</a></li>
                <li><a href="/education" className="hover:text-white transition-colors">Corvus Tanulás</a></li>
                <li><a href="/projects" className="hover:text-white transition-colors">Projektek</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Támogatás</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white transition-colors">Súgó központ</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Kapcsolat</a></li>
                <li><a href="/faq" className="hover:text-white transition-colors">GYIK</a></li>
                <li><a href="/guidelines" className="hover:text-white transition-colors">Irányelvek</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kapcsolat</h4>
              <div className="space-y-2 text-gray-400">
                <p>📧 info@corvus-platform.hu</p>
                <p>📞 +36 1 234 5678</p>
                <p>📍 Budapest, Magyarország</p>
              </div>
            </div>
          </div>
          
          <hr className="border-gray-700 my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2025 Corvus Platform Kft. Minden jog fenntartva.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Adatvédelem</a>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors">ÁSZF</a>
              <a href="/cookies" className="text-gray-400 hover:text-white transition-colors">Sütik</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;