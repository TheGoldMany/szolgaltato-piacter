// frontend/src/components/profile/ProfileView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';

// ✅ JAVÍTOTT INTERFACE - Backend válasz alapján
interface ServiceProfile {
  id: number;
  business_name: string;
  description: string;
  profile_image_url?: string;
  cover_image_url?: string;
  location_city: string;
  location_address?: string;
  price_category?: string;
  rating_average: number;
  rating_count: number;
  website?: string;
  availability_status?: string;
  first_name: string;        // ✅ Backend-ből jön
  last_name: string;         // ✅ Backend-ből jön
  email: string;             // ✅ Backend-ből jön
  specializations?: string[];
  services?: Array<{         // ✅ Backend-ből jön
    id: number;
    title: string;
    description?: string;
    base_price: number;
    price_unit: string;
    category: string;
  }>;
  modules?: Array<{
    module_type: string;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    content: any;
  }>;
}

const ProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<ServiceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  // ✅ JAVÍTOTT fetchProfile FÜGGVÉNY
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ JAVÍTOTT API ENDPOINT
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log(`🔍 Profil betöltése: ${apiUrl}/api/service-providers/${id}`);
      
      const response = await fetch(`${apiUrl}/api/service-providers/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📄 Profil adatok:', data);
      
      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.error || 'Profil nem található');
      }
    } catch (err: any) {
      console.error('❌ Error fetching profile:', err);
      setError(err.message || 'Hiba történt a profil betöltése során');
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          redirectTo: `/profile/${id}`,
          message: 'Jelentkezz be az üzenet küldéséhez!' 
        }
      });
      return;
    }

    navigate('/messages', { 
      state: { 
        startConversation: {
          userId: profile?.id,
          userName: profile?.business_name || `${profile?.first_name} ${profile?.last_name}`,
          profileImage: profile?.profile_image_url
        }
      }
    });
  };

  const handleProjectStart = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          redirectTo: `/profile/${id}`,
          message: 'Jelentkezz be a projekt indításához!' 
        }
      });
      return;
    }

    navigate('/projects/create', { 
      state: { 
        preselectedProvider: {
          id: profile?.id,
          name: profile?.business_name,
          category: profile?.specializations?.[0],
          profileImage: profile?.profile_image_url
        }
      }
    });
  };

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          redirectTo: `/profile/${id}`,
          message: 'Jelentkezz be az időpont foglaláshoz!' 
        }
      });
      return;
    }

    navigate('/booking', { 
      state: { 
        providerId: profile?.id,
        providerName: profile?.business_name
      }
    });
  };

  const getPriceCategoryText = (category?: string) => {
    switch (category) {
      case 'budget':
      case 'low':
        return 'Kedvező árak';
      case 'mid':
      case 'medium':
        return 'Közepes árak';
      case 'premium':
      case 'high':
        return 'Prémium árak';
      default:
        return 'Árak egyeztethetők';
    }
  };

  const getPriceCategoryColor = (category?: string) => {
    switch (category) {
      case 'budget':
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'mid':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'premium':
      case 'high':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 navbar-padding">
        <Navbar />
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 navbar-padding">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-xl p-8 text-center shadow-lg">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Hiba történt</h2>
            <p className="text-lg text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Vissza
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 navbar-padding">
      <Navbar />
      
      {/* Cover Image */}
      {profile.cover_image_url && (
        <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
          <img
            src={profile.cover_image_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Vissza az eredményekhez
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8 -mt-16 relative z-10">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0">
                  {profile.profile_image_url ? (
                    <img
                      src={profile.profile_image_url}
                      alt={profile.business_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    profile.business_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{profile.business_name}</h1>
                  <p className="text-blue-100 text-lg mb-2">
                    👤 {profile.first_name} {profile.last_name}
                  </p>
                  <p className="text-blue-100 text-lg mb-3">
                    📍 {profile.location_city}
                    {profile.location_address && `, ${profile.location_address}`}
                  </p>
                  
                  {/* Rating */}
                  {profile.rating_count > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-yellow-400 text-xl">⭐</span>
                      <span className="text-lg font-medium">{profile.rating_average.toFixed(1)}</span>
                      <span className="text-blue-100">({profile.rating_count} értékelés)</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {profile.specializations?.map((spec, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Bemutatkozás</h2>
              <p className="text-gray-700 leading-relaxed">
                {profile.description || 'A szolgáltató még nem írt bemutatkozást.'}
              </p>
            </div>

            {/* Services */}
            {profile.services && profile.services.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🛠️ Szolgáltatások</h2>
                <div className="space-y-4">
                  {profile.services.map((service, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                        <div className="text-right">
                          <span className="text-xl font-bold text-blue-600">
                            {service.base_price?.toLocaleString()} Ft
                          </span>
                          <span className="text-gray-500">/{service.price_unit}</span>
                        </div>
                      </div>
                      {service.description && (
                        <p className="text-gray-700 mb-2">{service.description}</p>
                      )}
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {service.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 Árazás</h2>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getPriceCategoryColor(profile.price_category)}`}>
                  {getPriceCategoryText(profile.price_category)}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-3">
                Az árak tájékoztató jellegűek. Pontos árajánlatért vedd fel a kapcsolatot!
              </p>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📍 Helyszín</h2>
              <div className="space-y-2">
                <p className="text-gray-700 font-medium">{profile.location_city}</p>
                {profile.location_address && (
                  <p className="text-gray-600">{profile.location_address}</p>
                )}
              </div>
            </div>

            {/* Availability */}
            {profile.availability_status && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🕒 Elérhetőség</h2>
                <p className="text-gray-700">{profile.availability_status}</p>
              </div>
            )}

            {/* Moduláris profil tartalom (ha vannak modulok) */}
            {profile.modules && profile.modules.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Profil tartalom</h2>
                <div className="grid grid-cols-4 gap-4">
                  {profile.modules.map((module, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      style={{
                        gridColumn: `span ${module.width}`,
                        gridRow: `span ${module.height}`
                      }}
                    >
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        {module.module_type}
                      </div>
                      <div className="text-xs text-gray-500">
                        {JSON.stringify(module.content)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🚀 Kapcsolatfelvétel
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={handleContactClick}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  💬 Üzenet küldése
                </button>
                
                <button 
                  onClick={handleProjectStart}
                  className="w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                >
                  📋 Projekt indítása
                </button>

                <button 
                  onClick={handleBookingClick}
                  className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  📅 Időpont foglalás
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📞 Elérhetőségek
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-blue-600">📧</span>
                  <a 
                    href={`mailto:${profile.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {profile.email}
                  </a>
                </div>
                {profile.website && (
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600">🌐</span>
                    <a 
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Weboldal
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ✅ Bizalom
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Ellenőrzött profil</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Aktív a platformon</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Gyors válaszadó</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
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
    </div>
  );
};

export default ProfileView;