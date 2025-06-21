// frontend/src/pages/ServiceProviders.tsx - JAVÍTOTT API HÍVÁSOK
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

// ✅ HASZNÁLJUK A HELYES SERVICE-T!
interface ServiceProvider {
  id: number;
  business_name: string;
  description: string;
  location_city: string;
  location_address?: string;
  price_category?: 'budget' | 'mid' | 'premium';
  price_range_min?: number;
  price_range_max?: number;
  contact_phone?: string;
  contact_email?: string;
  availability_hours?: string;
  specializations: string[];
  profile_image_url?: string;
  first_name: string;
  last_name: string;
  rating_average: number;
  rating_count: number;
  created_at: string;
  services?: Array<{
    id: number;
    title: string;
    base_price: number;
    price_unit: string;
    category: string;
  }>;
}

interface ApiResponse {
  success: boolean;
  data: {
    profiles: ServiceProvider[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasMore: boolean;
    };
    filters: {
      query: string | null;
      city: string | null;
      price_category: string | null;
      category: string | null;
    };
  };
}

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
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
    hasMore: false
  });

  // URL paraméterek kiolvasása
  const query = searchParams.get('search') || searchParams.get('query') || '';
  const city = searchParams.get('city') || '';
  const category = searchParams.get('category') || '';
  const specialization = searchParams.get('specialization') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // ✅ Helper függvény URL paraméterek összeállításához
  const buildSearchParams = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    const currentParams = {
      query: query || '',
      city: city || '',
      category: category || specialization || '',
      page: page.toString(),
      ...overrides
    };
    
    // Csak nem üres értékeket adjuk hozzá
    Object.entries(currentParams).forEach(([key, value]) => {
      if (value && value !== '1' && value !== 'all') {
        params.append(key, value);
      }
    });
    
    return params.toString();
  };

  useEffect(() => {
    fetchProviders();
  }, [query, city, category, specialization, page]);

  const fetchProviders = async () => {
    // ✅ params kiemelése a try blokk elé
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (city) params.append('city', city);
    if (category) params.append('category', category);
    if (specialization) params.append('category', specialization);
    params.append('page', page.toString());
    params.append('limit', '12');

    try {
      setLoading(true);
      setError(null);

      // ✅ JAVÍTOTT API ENDPOINT - /service-providers használata
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log(`🔍 API hívás: ${apiUrl}/api/service-providers?${params}`);
      
      const response = await fetch(`${apiUrl}/api/service-providers?${params}`);
      
      if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log('📄 API válasz:', data);

      if (data.success) {
        setProviders(data.data.profiles || []);
        setPagination({
          page: data.data.pagination?.page || 1,
          total: data.data.pagination?.total || 0,
          pages: data.data.pagination?.pages || 0,
          hasMore: data.data.pagination?.hasMore || false
        });
        console.log(`✅ Betöltve ${data.data.profiles?.length || 0} szolgáltató`);
      } else {
        throw new Error('A szervertől érkező válasz hibás');
      }
    } catch (err: any) {
      console.error('❌ Error fetching providers:', err);
      setError(err.message || 'Hiba történt a szolgáltatók betöltése során');
      setProviders([]);
      
      // ✅ FALLBACK - most már látja a params-t!
      if (err.message.includes('404')) {
        console.log('🔄 Próbálkozás fallback endpoint-tal...');
        try {
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          const fallbackResponse = await fetch(`${apiUrl}/api/users/profiles/search?${params}`);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('✅ Fallback sikeres:', fallbackData);
            setProviders(fallbackData.data?.profiles || []);
            setError(null);
          }
        } catch (fallbackErr) {
          console.error('❌ Fallback is failed:', fallbackErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Kategóriák listája
  const categories = [
    { id: 'all', name: 'Minden', icon: '🏠' },
    { id: 'Építés és Felújítás', name: 'Építkezés', icon: '🏗️' },
    { id: 'Vízszerelés', name: 'Vízszerelés', icon: '🔧' },
    { id: 'Villanyszerelés', name: 'Villanyszerelés', icon: '⚡' },
    { id: 'Festés és Mázolás', name: 'Festés', icon: '🎨' },
    { id: 'Burkolás', name: 'Burkolás', icon: '🏗️' },
    { id: 'Kertépítés', name: 'Kertészet', icon: '🌱' },
    { id: 'Takarítás és Háztartás', name: 'Takarítás', icon: '🧹' },
    { id: 'Webfejlesztés', name: 'Webfejlesztés', icon: '💻' },
    { id: 'Üzleti Szolgáltatások', name: 'Üzleti', icon: '📊' }
  ];

  // Ár kategória színek és szövegek
  const getPriceCategoryInfo = (category?: string) => {
    switch (category) {
      case 'budget':
      case 'low':
        return { color: 'bg-green-100 text-green-800', text: 'Kedvező' };
      case 'mid':
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Közepes' };
      case 'premium':
      case 'high':
        return { color: 'bg-purple-100 text-purple-800', text: 'Prémium' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Egyeztethető' };
    }
  };

  // Ár formázás
  const formatPriceRange = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} Ft`;
    }
    if (min) return `${min.toLocaleString()} Ft-tól`;
    if (max) return `${max.toLocaleString()} Ft-ig`;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 navbar-padding">
      <Navbar />
      
      {/* Header */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🔍 Szolgáltatók böngészése
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Válassz a szakértő szolgáltatók közül, vagy szűrd le a találatokat
            </p>
          </div>

          {/* Keresési információk */}
          {(query || city || category || specialization) && (
            <div className="mt-8 bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Aktív szűrők:</h3>
              <div className="flex flex-wrap gap-2">
                {query && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Keresés: "{query}"
                  </span>
                )}
                {city && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Város: {city}
                  </span>
                )}
                {(category || specialization) && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Kategória: {category || specialization}
                  </span>
                )}
                <Link 
                  to="/services"
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200"
                >
                  ✕ Szűrők törlése
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white py-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-3 pb-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={cat.id === 'all' ? '/services' : `/services?category=${encodeURIComponent(cat.id)}`}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  (cat.id === 'all' && !category && !specialization) || 
                  cat.id === category || 
                  cat.id === specialization
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
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {loading ? (
            <Loading text="Szolgáltatók betöltése..." />
          ) : error ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-lg">
              <div className="text-red-600 mb-4">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold mb-2">Hiba történt</h2>
                <p className="text-lg mb-4">{error}</p>
                <div className="text-sm text-gray-600 bg-gray-100 p-4 rounded-lg">
                  <p><strong>Debug info:</strong></p>
                  <p>Backend URL: {process.env.REACT_APP_API_URL || 'http://localhost:5000'}</p>
                  <p>Endpoint: /api/service-providers</p>
                  <p>Fallback: /api/users/profiles/search</p>
                </div>
              </div>
              <div className="flex gap-4 justify-center mt-6">
                <button
                  onClick={fetchProviders}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Újrapróbálás
                </button>
                <Link 
                  to="/" 
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ← Vissza a főoldalra
                </Link>
              </div>
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
                  Találatok ({pagination.total})
                </h2>
                <p className="text-gray-600">
                  {providers.length} szolgáltató a {pagination.total}-ból/ből
                </p>
              </div>

              {/* Providers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <div key={provider.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    
                    {/* Provider Header */}
                    <div className="p-6 border-b">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                          {provider.profile_image_url ? (
                            <img
                              src={provider.profile_image_url}
                              alt={provider.business_name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            provider.business_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {provider.business_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            📍 {provider.location_city}
                            {provider.location_address && `, ${provider.location_address}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            👤 {provider.first_name} {provider.last_name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Provider Content */}
                    <div className="p-6">
                      {/* Description */}
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                        {provider.description}
                      </p>

                      {/* Services */}
                      {provider.services && provider.services.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Szolgáltatások:</h4>
                          <div className="space-y-1">
                            {provider.services.slice(0, 2).map((service, index) => (
                              <div key={index} className="flex justify-between items-center text-xs">
                                <span className="text-gray-700">{service.title}</span>
                                <span className="text-blue-600 font-medium">
                                  {service.base_price?.toLocaleString()} Ft/{service.price_unit}
                                </span>
                              </div>
                            ))}
                            {provider.services.length > 2 && (
                              <p className="text-xs text-gray-500">
                                +{provider.services.length - 2} további szolgáltatás
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Specializations */}
                      {provider.specializations && provider.specializations.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {provider.specializations.slice(0, 3).map((spec, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {spec}
                              </span>
                            ))}
                            {provider.specializations.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{provider.specializations.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Rating */}
                      {provider.rating_count > 0 && (
                        <div className="mb-4 flex items-center gap-2">
                          <div className="flex items-center">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-sm font-medium">{provider.rating_average.toFixed(1)}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({provider.rating_count} értékelés)
                          </span>
                        </div>
                      )}

                      {/* Price Category */}
                      {provider.price_category && (
                        <div className="mb-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriceCategoryInfo(provider.price_category).color}`}>
                            💰 {getPriceCategoryInfo(provider.price_category).text}
                          </span>
                          {formatPriceRange(provider.price_range_min, provider.price_range_max) && (
                            <p className="text-sm text-gray-600 mt-1">
                              {formatPriceRange(provider.price_range_min, provider.price_range_max)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Contact Info */}
                      <div className="mb-4 space-y-1">
                        {provider.contact_phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>📱</span>
                            <span>{provider.contact_phone}</span>
                          </div>
                        )}
                        {provider.availability_hours && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>🕒</span>
                            <span className="truncate">{provider.availability_hours}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Provider Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t">
                      <Link
                        to={`/profile/${provider.id}`}
                        className="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Profil megtekintése →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center gap-2">
                    {pagination.page > 1 && (
                      <Link
                        to={`/services?${buildSearchParams({ page: (pagination.page - 1).toString() })}`}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        ← Előző
                      </Link>
                    )}
                    
                    <span className="px-4 py-2 text-gray-600">
                      {pagination.page} / {pagination.pages}
                    </span>
                    
                    {pagination.page < pagination.pages && (
                      <Link
                        to={`/services?${buildSearchParams({ page: (pagination.page + 1).toString() })}`}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Következő →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

{/* Footer */}
<footer className="bg-gray-900 text-white py-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
  {/* ✅ CORVUS LOGO FOOTER-BEN - KÖZÉPEN, CSAK LOGO */}
  <div className="flex justify-center mb-4">
    <img 
      src="./corvus-logo-crop.png"
      alt="Corvus Logo" 
      className="h-12 w-auto" // Nagyobb logo (48px)
      onError={(e) => {
        // Fallback - eredeti emoji
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = target.nextElementSibling as HTMLElement;
        if (fallback) {
          fallback.style.display = 'inline';
        }
      }}
    />
    <span className="hidden text-2xl">🚀</span>
  </div>
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

      </section>
    </div>
    
  );
};

export default ServiceProviders;