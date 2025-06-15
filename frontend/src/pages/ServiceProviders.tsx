import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

interface ServiceProvider {
  id: number;
  business_name: string;
  description: string;
  location_city: string;
  rating_average: string;
  rating_count: number;
  first_name: string;
  last_name: string;
  price_category: string;
  categories: string[];
}

interface ApiResponse {
  success: boolean;
  data: ServiceProvider[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Navbar komponens (ugyanaz mint HomePage-ben)
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Főoldal', icon: '🏠' },
    { href: '/services', label: 'Szolgáltatók', icon: '🔍' },
    { href: '/categories', label: 'Kategóriák', icon: '📋' },
    { href: '/how-it-works', label: 'Hogyan működik', icon: '❓' },
  ];

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

          {/* Right Side - Auth Buttons */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3">
              <a href="/login" className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                Bejelentkezés
              </a>
              <a href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Regisztráció
              </a>
            </div>

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
              
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <a href="/login" className="block w-full px-4 py-2 text-center text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  Bejelentkezés
                </a>
                <a href="/register" className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Regisztráció
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Loading komponens
const Loading = ({ size = 'md', text = 'Betöltés...' }: { size?: string; text?: string }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size as keyof typeof sizeClasses]}`}></div>
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  );
};

const ServiceProviders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const city = searchParams.get('city');

  useEffect(() => {
    fetchProviders();
  }, [category, search, city]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (city) params.append('city', city);
      params.append('limit', '20');

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/profiles?${params}`
      );
      const data: ApiResponse = await response.json();

      if (data.success) {
        setProviders(data.data);
      } else {
        throw new Error('Failed to fetch providers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (slug: string) => {
    const categoryMap: { [key: string]: string } = {
      'epites-felujitas': 'Építés és Felújítás',
      'grafikai-tervezes': 'Kreatív & Design',
      'it-technologia': 'IT & Fejlesztés',
      'oktatas-kepzes': 'Oktatás',
      'kert-kulso-teruletek': 'Kert & Háztartás',
      'uzleti-szolgaltatasok': 'Jogi & Pénzügyi'
    };
    return categoryMap[slug] || slug;
  };

  const categories = [
    { id: 'epites-felujitas', name: 'Építés & Felújítás', icon: '🏗️' },
    { id: 'it-technologia', name: 'IT & Fejlesztés', icon: '💻' },
    { id: 'grafikai-tervezes', name: 'Kreatív & Design', icon: '🎨' },
    { id: 'oktatas-kepzes', name: 'Oktatás', icon: '📚' },
    { id: 'kert-kulso-teruletek', name: 'Kert & Háztartás', icon: '🌱' },
    { id: 'uzleti-szolgaltatasok', name: 'Jogi & Pénzügyi', icon: '⚖️' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 navbar-padding">
        <Navbar />
        <Loading size="lg" text="Szolgáltatók betöltése..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 navbar-padding">
      <Navbar />

      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {category ? getCategoryName(category) : 'Szolgáltatók böngészése'}
          </h1>
          {search && (
            <p className="text-xl text-blue-100 mb-4">
              Keresés: "{search}"
            </p>
          )}
          <p className="text-blue-100 text-lg">
            {error ? '0' : providers.length} szolgáltató találat
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Mit keresel?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-6 py-3 text-lg rounded-l-lg border-0 focus:outline-none focus:ring-4 focus:ring-white/30 text-gray-900"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border-0 bg-white focus:outline-none focus:ring-4 focus:ring-white/30 text-gray-900"
                >
                  <option value="">Kategória</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button className="px-6 py-3 bg-white text-blue-600 rounded-r-lg hover:bg-gray-100 transition-colors font-semibold">
                  🔍 Keresés
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link 
              to="/services" 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
            >
              🔍 Minden szolgáltató
            </Link>
            {categories.map((cat) => (
              <Link 
                key={cat.id}
                to={`/services?category=${cat.id}`} 
                className={`px-4 py-2 rounded-lg transition-colors ${
                  category === cat.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`}
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-lg">
              <div className="text-red-600 mb-4">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold mb-2">Hiba történt</h2>
                <p className="text-lg">{error}</p>
              </div>
              <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Vissza a főoldalra
              </Link>
            </div>
          ) : providers.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-lg">
              <div className="text-gray-600 mb-6">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold mb-2">Nincs találat</h2>
                <p className="text-lg">Nincs szolgáltató a megadott kritériumokkal.</p>
              </div>
              <div className="flex gap-4 justify-center">
                <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Vissza a főoldalra
                </Link>
                <Link to="/services" className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  Minden szolgáltató
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Találatok ({providers.length})
                </h2>
                <p className="text-gray-600">
                  Válassz a szolgáltatók közül, vagy finomítsd a keresést
                </p>
              </div>

              {/* Providers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <div 
                    key={provider.id} 
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-blue-300 group"
                  >
                    {/* Provider Header */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {provider.business_name}
                      </h3>
                      <p className="text-gray-600">
                        {provider.first_name} {provider.last_name}
                      </p>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {provider.description?.substring(0, 120)}...
                    </p>
                    
                    {/* Location & Rating */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600 flex items-center">
                        📍 {provider.location_city}
                      </span>
                      
                      {parseFloat(provider.rating_average) > 0 && (
                        <span className="text-amber-600 flex items-center">
                          ⭐ {parseFloat(provider.rating_average).toFixed(1)} ({provider.rating_count})
                        </span>
                      )}
                    </div>

                    {/* Categories */}
                    {provider.categories && provider.categories.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {provider.categories.slice(0, 2).map((cat, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {cat}
                            </span>
                          ))}
                          {provider.categories.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{provider.categories.length - 2} további
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Price Category */}
                    {provider.price_category && (
                      <div className="mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          provider.price_category === 'budget' ? 'bg-green-100 text-green-800' :
                          provider.price_category === 'mid' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {provider.price_category === 'budget' ? '💰 Kedvező' :
                           provider.price_category === 'mid' ? '💰💰 Közepes' :
                           '💰💰💰 Prémium'}
                        </span>
                      </div>
                    )}

                    {/* View Profile Button */}
                    <Link 
                      to={`/profile/${provider.id}`}
                      className="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Profil megtekintése
                    </Link>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-12">
                <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  További szolgáltatók betöltése
                </button>
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

export default ServiceProviders;