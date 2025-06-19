// frontend/src/components/profile/StandardProfileView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';

interface ServiceProfile {
  id: number;
  business_name: string;
  description: string;
  profile_image_url: string;
  location_city: string;
  location_address: string;
  price_category: 'budget' | 'mid' | 'premium';
  price_range_min: number;
  price_range_max: number;
  contact_phone: string;
  contact_email: string;
  availability_hours: string;
  specializations: string[];
  user_id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const StandardProfileView: React.FC = () => {
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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profiles/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.error || 'Profil nem található');
      }
    } catch (err: any) {
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
          userId: profile?.user_id,
          userName: profile?.business_name || `${profile?.user.first_name} ${profile?.user.last_name}`,
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
          userId: profile?.user_id,
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

  const getPriceCategoryText = (category: string) => {
    switch (category) {
      case 'budget': return 'Kedvező árak';
      case 'mid': return 'Közepes árak';
      case 'premium': return 'Prémium árak';
      default: return 'Árak egyeztethetők';
    }
  };

  const getPriceCategoryColor = (category: string) => {
    switch (category) {
      case 'budget': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-yellow-100 text-yellow-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8">
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
                  <p className="text-blue-100 text-lg mb-3">
                    📍 {profile.location_city}
                  </p>
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

            {/* Price Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 Árazás</h2>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getPriceCategoryColor(profile.price_category)}`}>
                  {getPriceCategoryText(profile.price_category)}
                </span>
                {profile.price_range_min && profile.price_range_max && (
                  <span className="text-lg font-semibold text-gray-900">
                    {profile.price_range_min.toLocaleString()} - {profile.price_range_max.toLocaleString()} Ft
                  </span>
                )}
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
            {profile.availability_hours && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🕒 Elérhetőség</h2>
                <p className="text-gray-700">{profile.availability_hours}</p>
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
                {profile.contact_phone && (
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600">📱</span>
                    <a 
                      href={`tel:${profile.contact_phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {profile.contact_phone}
                    </a>
                  </div>
                )}
                {profile.contact_email && (
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600">✉️</span>
                    <a 
                      href={`mailto:${profile.contact_email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {profile.contact_email}
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
    </div>
  );
};

export default StandardProfileView;