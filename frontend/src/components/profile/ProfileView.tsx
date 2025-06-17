// frontend/src/components/profile/ProfileView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';

// Interfaces
interface Category {
  id: number;
  name: string;
  slug: string;
  is_primary: boolean;
}

interface ServiceProfile {
  id: number;
  user_id: number;
  business_name: string;
  description: string | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  website: string | null;
  location_city: string | null;
  location_address: string | null;
  price_category: 'low' | 'medium' | 'high' | null;
  availability_status: string;
  rating_average: string;
  rating_count: number;
  profile_completed: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  user_type: string;
  categories: Category[] | null;
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

const ProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ServiceProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  const fetchProfile = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/profiles/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }
      
      if (data.success) {
        setProfile(data.data);
      } else {
        throw new Error(data.message || 'Profile not found');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = (): void => {
    if (profile?.email) {
      window.location.href = `mailto:${profile.email}?subject=Érdeklődés - ${profile.business_name}`;
    }
  };

  const handlePhoneClick = (): void => {
    if (profile?.phone) {
      window.location.href = `tel:${profile.phone}`;
    }
  };

  const handleWebsiteClick = (): void => {
    if (profile?.website) {
      window.open(profile.website, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBackClick = (): void => {
    navigate(-1);
  };

  const getPriceCategoryLabel = (category: string | null): string => {
    switch (category) {
      case 'low': return 'Kedvező';
      case 'medium': return 'Közepes';
      case 'high': return 'Prémium';
      default: return '';
    }
  };

  const getPriceCategoryColor = (category: string | null): string => {
    switch (category) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 navbar-padding">
        <Navbar />
        <Loading size="lg" text="Profil betöltése..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 navbar-padding">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-xl p-8 text-center shadow-lg">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Hiba történt</h2>
            <p className="text-lg text-gray-600 mb-6">{error}</p>
            <button 
              onClick={handleBackClick}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Vissza
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 navbar-padding">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-xl p-8 text-center shadow-lg">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profil nem található</h2>
            <p className="text-lg text-gray-600 mb-6">A keresett szolgáltató profil nem található.</p>
            <button 
              onClick={handleBackClick}
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
          onClick={handleBackClick}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          ← Vissza a listához
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative">
            {profile.cover_image_url ? (
              <img 
                src={profile.cover_image_url} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-6xl font-bold opacity-20">
                  {profile.business_name.charAt(0)}
                </div>
              </div>
            )}
            
            {/* Featured Badge */}
            {profile.is_featured && (
              <div className="absolute top-4 right-4">
                <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ⭐ Kiemelt
                </span>
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
              
              {/* Profile Image */}
              <div className="flex-shrink-0 mb-6 md:mb-0">
                <div className="w-32 h-32 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden border-4 border-white -mt-16 relative">
                  {profile.profile_image_url ? (
                    <img 
                      src={profile.profile_image_url} 
                      alt={profile.business_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-blue-600">
                      {profile.business_name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {profile.business_name}
                  </h1>
                  {profile.availability_status === 'available' && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      🟢 Elérhető
                    </span>
                  )}
                </div>
                
                <div className="text-xl text-gray-600 mb-4">
                  {profile.first_name} {profile.last_name}
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {profile.location_city && (
                    <span className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                      📍 {profile.location_city}
                    </span>
                  )}
                  
                  {parseFloat(profile.rating_average) > 0 && (
                    <span className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                      ⭐ {parseFloat(profile.rating_average).toFixed(1)} ({profile.rating_count} értékelés)
                    </span>
                  )}
                  
                  {profile.price_category && (
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getPriceCategoryColor(profile.price_category)}`}>
                      💰 {getPriceCategoryLabel(profile.price_category)} árak
                    </span>
                  )}
                </div>

                {/* Categories */}
                {profile.categories && profile.categories.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Szolgáltatási területek:</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.categories.map((category) => (
                        <span 
                          key={category.id}
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            category.is_primary 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleContactClick}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    ✉️ Kapcsolatfelvétel
                  </button>
                  
                  {profile.phone && (
                    <button
                      onClick={handlePhoneClick}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      📞 Hívás
                    </button>
                  )}
                  
                  {profile.website && (
                    <button
                      onClick={handleWebsiteClick}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                    >
                      🌐 Weboldal
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description */}
            {profile.description && (
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 Bemutatkozás</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                    {profile.description}
                  </p>
                </div>
              </div>
            )}

            {/* Portfolio/Gallery Placeholder */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📸 Munkáim</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Placeholder images */}
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors cursor-pointer">
                    <span className="text-2xl">🖼️</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-center mt-4">A galéria hamarosan elérhető lesz</p>
            </div>

            {/* Reviews Section Placeholder */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">⭐ Értékelések</h2>
              <div className="space-y-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center mb-2">
                      <div className="flex text-amber-400 mr-3">
                        {'★'.repeat(5)}
                      </div>
                      <span className="font-medium text-gray-900">Ügyfél #{i}</span>
                    </div>
                    <p className="text-gray-600">Kiváló munka, pontosan időben és profi módon végezte el a feladatot. Mindenkinek ajánlom!</p>
                    <span className="text-sm text-gray-500">2024. március {i}.</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-center mt-4">Az értékelési rendszer hamarosan elérhető lesz</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Contact Info */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📞 Elérhetőségek</h3>
              <div className="space-y-3">
                {profile.phone && (
                  <div className="flex items-center text-gray-600">
                    <span className="w-6">📞</span>
                    <span className="ml-2">{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <span className="w-6">✉️</span>
                  <span className="ml-2">{profile.email}</span>
                </div>
                {profile.website && (
                  <div className="flex items-center text-gray-600">
                    <span className="w-6">🌐</span>
                    <span className="ml-2 break-all">{profile.website}</span>
                  </div>
                )}
                {profile.location_address && (
                  <div className="flex items-center text-gray-600">
                    <span className="w-6">📍</span>
                    <span className="ml-2">{profile.location_address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Statisztikák</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Regisztráció:</span>
                  <span className="font-medium">
                    {new Date(profile.created_at).toLocaleDateString('hu-HU')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Értékelések:</span>
                  <span className="font-medium">{profile.rating_count} db</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profil teljessége:</span>
                  <span className="font-medium">
                    {profile.profile_completed ? '✅ Teljes' : '⏳ Folyamatban'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Státusz:</span>
                  <span className={`font-medium ${profile.availability_status === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                    {profile.availability_status === 'available' ? '🟢 Elérhető' : '🔴 Nem elérhető'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Gyors műveletek</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleContactClick}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  💬 Üzenet küldése
                </button>
                <button className="w-full px-4 py-3 border-2 border-amber-500 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-semibold">
                  ⭐ Kedvencekhez
                </button>
                <button className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                  📋 Projekt indítása
                </button>
                <button 
                  onClick={() => window.print()}
                  className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  🖨️ Profil nyomtatása
                </button>
              </div>
            </div>

            {/* Trust & Safety */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🛡️ Biztonság</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✅</span>
                  <span className="text-sm">Email cím megerősítve</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✅</span>
                  <span className="text-sm">Telefon megerősítve</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✅</span>
                  <span className="text-sm">Corvus hitelesített</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="text-red-600 text-sm hover:underline">
                    🚨 Profil jelentése
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
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

export default ProfileView;