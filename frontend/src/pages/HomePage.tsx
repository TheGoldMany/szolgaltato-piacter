// frontend/src/pages/HomePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const categories = [
    { id: 'epites-felujitas', name: 'Építés & Felújítás', icon: '🏗️', count: 234 },
    { id: 'it-technologia', name: 'IT & Fejlesztés', icon: '💻', count: 189 },
    { id: 'grafikai-tervezes', name: 'Kreatív & Design', icon: '🎨', count: 156 },
    { id: 'oktatas-kepzes', name: 'Oktatás', icon: '📚', count: 98 },
    { id: 'kert-kulso-teruletek', name: 'Kert & Háztartás', icon: '🌱', count: 145 },
    { id: 'uzleti-szolgaltatasok', name: 'Jogi & Pénzügyi', icon: '⚖️', count: 67 }
  ];

  const trendingSearches = [
    { service: 'Weboldal készítés', icon: '💻', searches: 847 },
    { service: 'Csapszerelő', icon: '🔧', searches: 623 },
    { service: 'Logo tervezés', icon: '🎨', searches: 592 },
    { service: 'Villanyszerelés', icon: '⚡', searches: 534 },
    { service: 'Mobilapp fejlesztés', icon: '📱', searches: 489 },
    { service: 'Takarítás', icon: '🏠', searches: 445 }
  ];

  const featuredProviders = [
    { 
      name: 'Nagy Anna', 
      service: 'Grafikus & Webdesigner', 
      rating: 4.9, 
      reviews: 47,
      image: '👩‍💻',
      pricing: '15.000 Ft-tól',
      verified: true
    },
    { 
      name: 'Kovács Péter', 
      service: 'Villanyszerelő', 
      rating: 5.0, 
      reviews: 89,
      image: '👨‍🔧',
      pricing: '8.000 Ft-tól',
      verified: true
    },
    { 
      name: 'Szabó Márta', 
      service: 'Fotográfus', 
      rating: 4.8, 
      reviews: 156,
      image: '👩‍💼',
      pricing: '25.000 Ft-tól',
      verified: true
    },
    { 
      name: 'Tóth János', 
      service: 'Kőműves', 
      rating: 4.9, 
      reviews: 73,
      image: '👨‍💼',
      pricing: '12.000 Ft-tól',
      verified: true
    }
  ];

  const exampleQuestions = [
    'Mennyibe kerül egy logo tervezés?',
    'Ki tudja megjavítani a csapom?',
    'Hogyan válasszak webfejlesztőt?'
  ];

  return (
    // FONTOS: navbar-padding osztály hozzáadva a container div-hez
    <div className="min-h-screen bg-gray-50 navbar-padding">
      {/* Navigation - Az új Navbar komponenst használjuk */}
      <Navbar />

      {/* AI Chat Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <div className="text-6xl mb-6">🤖</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Corvus AI - Itt minden kérdésre van válasz és szakember
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Írj be bármilyen problémát, az AI segít megtalálni a megfelelő megoldást és szakembert
            </p>
            
            {/* AI Chat Input */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Mondd el mi a problémád..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 text-lg rounded-2xl border-0 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl text-gray-900"
                />
                <button 
                  onClick={() => navigate('/ai-chat')}
                  className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  🚀
                </button>
              </div>
            </div>

            {/* Example Questions */}
            <div className="flex flex-wrap gap-3 justify-center">
              {exampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(question);
                    navigate('/ai-chat');
                  }}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors text-sm"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Searches */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🔥 Most ezeket keresik
            </h2>
            <p className="text-lg text-gray-600">
              Népszerű szolgáltatások és trendek
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingSearches.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate('/services')}
                className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border hover:border-blue-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-3xl mr-4 group-hover:scale-110 transition-transform">{item.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.service}</h3>
                      <p className="text-sm text-gray-600">{item.searches} keresés</p>
                    </div>
                  </div>
                  <span className="text-2xl text-emerald-500 group-hover:scale-110 transition-transform">📈</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ⭐ Hitelesített Corvus szakemberek
            </h2>
            <p className="text-lg text-gray-600">
              Ellenőrzött, megbízható szolgáltatók
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProviders.map((provider, index) => (
              <div
                key={index}
                onClick={() => navigate('/services')}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-blue-300 group cursor-pointer"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{provider.image}</div>
                  <div className="flex items-center justify-center mb-2">
                    <h3 className="font-bold text-gray-900 mr-2">{provider.name}</h3>
                    {provider.verified && (
                      <span className="text-blue-600">🛡️</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{provider.service}</p>
                  
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex text-amber-400 mr-2">
                      ⭐⭐⭐⭐⭐
                    </div>
                    <span className="text-sm text-gray-600">
                      {provider.rating} ({provider.reviews})
                    </span>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <p className="text-blue-600 font-semibold">{provider.pricing}</p>
                  </div>
                  
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Profil megtekintése
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <button 
              onClick={() => navigate('/services')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Összes szakember megtekintése
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Népszerű kategóriák
            </h2>
            <p className="text-lg text-gray-600">
              Válassz a szolgáltatási területek közül
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <div
                key={index}
                onClick={() => navigate('/categories')}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-blue-300 group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-xs text-gray-600">{category.count} szolgáltató</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Miért választd a Corvus Platformot?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-vezérelt keresés</h3>
              <p className="text-gray-600">
                Természetes nyelvű keresés és személyre szabott ajánlások
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Hitelesített szakemberek</h3>
              <p className="text-gray-600">
                Minden szolgáltató ellenőrzött és tanúsítvánnyal rendelkezik
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-amber-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Projekt munkaterület</h3>
              <p className="text-gray-600">
                Közös munkaterület csapatokkal és projektek kezelésével
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">2,340+</div>
              <div className="text-blue-200">Aktív szolgáltató</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">15,678+</div>
              <div className="text-blue-200">Sikeres projekt</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">4.9/5</div>
              <div className="text-blue-200">Átlagos értékelés</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Ügyfélszolgálat</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Kezdd el még ma!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Csatlakozz több ezer elégedett felhasználónkhoz
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              Regisztráció szakemberként 🚀
            </button>
            <button 
              onClick={() => navigate('/services')}
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold"
            >
              Szolgáltatók böngészése
            </button>
          </div>
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

export default HomePage;