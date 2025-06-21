// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Helyes import
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

interface DashboardStats {
  totalProfiles?: number;
  totalViews?: number;
  totalMessages?: number;
  totalBookings?: number;
  totalFavorites?: number;
  totalProjects?: number;
}

const Dashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load user data and stats from database
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load user profile data
        const profileResponse = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        const profileData = await profileResponse.json();
        if (profileData.success) {
          setUserProfile(profileData.user);
        }

        // Load dashboard statistics
        const statsResponse = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.stats);
        } else {
          // Fallback to default stats if API not implemented yet
          setStats({
            totalProfiles: user?.userType === 'service_provider' ? 1 : 0,
            totalViews: user?.userType === 'service_provider' ? 125 : 0,
            totalMessages: 8,
            totalBookings: user?.userType === 'customer' ? 3 : 0, // VISSZA: client -> customer
            totalFavorites: user?.userType === 'customer' ? 12 : 0, // VISSZA: client -> customer
            totalProjects: user?.userType === 'service_provider' ? 5 : 0,
          });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to default stats
        setStats({
          totalProfiles: user?.userType === 'service_provider' ? 1 : 0,
          totalViews: user?.userType === 'service_provider' ? 125 : 0,
          totalMessages: 8,
          totalBookings: user?.userType === 'customer' ? 3 : 0, // VISSZA: client -> customer
          totalFavorites: user?.userType === 'customer' ? 12 : 0, // VISSZA: client -> customer
          totalProjects: user?.userType === 'service_provider' ? 5 : 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'A kép mérete ne legyen nagyobb 5MB-nál' });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Csak képfájlok engedélyezettek' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Update local user profile state
        setUserProfile((prev: any) => ({
          ...prev,
          profileImage: data.imageUrl
        }));

        // Update global user context
        if (updateUser) {
          updateUser({
            ...user!,
            profileImage: data.imageUrl
          });
        }

        setMessage({ type: 'success', text: 'Profilkép sikeresen feltöltve!' });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Hiba történt a kép feltöltése során' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Hiba történt a kép feltöltése során' });
    } finally {
      setIsUploading(false);
    }
  };

  // Szolgáltató Dashboard
  const ServiceProviderDashboard = () => (
    <div className="space-y-8">
      {/* Alert Messages */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {message.type === 'success' ? '✅' : '❌'}
            </span>
            {message.text}
          </div>
        </div>
      )}

      {/* Üdvözlő szekció profilkép feltöltéssel */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              Üdvözöljük, {userProfile?.firstName || user?.firstName}! 🎉
            </h1>
            <p className="text-blue-100 text-lg">
              Szolgáltatói dashboard - Itt kezelheti szolgáltatásait és projektjeit
            </p>
          </div>
          
          {/* Profilkép feltöltő */}
          <div className="flex flex-col items-center space-y-3 ml-8">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white bg-opacity-20 flex items-center justify-center border-3 border-white border-opacity-30">
              {userProfile?.profileImage || user?.profileImage ? (
                <img 
                  src={userProfile?.profileImage || user?.profileImage} 
                  alt="Profilkép" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl text-white">
                  {(userProfile?.firstName || user?.firstName)?.[0]?.toUpperCase() || '👤'}
                </span>
              )}
            </div>
            
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
              <span className="cursor-pointer inline-flex items-center px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-xs font-medium text-white hover:bg-opacity-30 disabled:opacity-50 transition-all">
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Feltöltés...
                  </>
                ) : (
                  <>📷 Kép</>
                )}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Statisztika kártyák */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Profiljaim</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProfiles}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">👤</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Profil megtekintések</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalViews}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">👁️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Aktív projektek</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-2xl">🏗️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Üzenetek</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalMessages}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-2xl">💬</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gyors műveletek */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">🚀 Gyors műveletek</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/profile/modular-editor')}
            className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
          >
            <div className="bg-blue-600 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-white text-lg">🎨</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Moduláris szerkesztő</h3>
              <p className="text-sm text-gray-600">Profil testreszabása</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/profile/edit')}
            className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
          >
            <div className="bg-green-600 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-white text-lg">✏️</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Profil szerkesztése</h3>
              <p className="text-sm text-gray-600">Alapadatok módosítása</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/workspace')}
            className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200 group"
          >
            <div className="bg-purple-600 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-white text-lg">🏗️</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Projektek</h3>
              <p className="text-sm text-gray-600">Projektmenedzsment</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/orders')}
            className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all duration-200 group"
          >
            <div className="bg-orange-600 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-white text-lg">📦</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Megrendelések</h3>
              <p className="text-sm text-gray-600">Rendelések kezelése</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/my-courses')}
            className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 group"
          >
            <div className="bg-indigo-600 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-white text-lg">🎓</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Tanúsítványaim</h3>
              <p className="text-sm text-gray-600">Szakképzések</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/messages')}
            className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-pink-200 transition-all duration-200 group"
          >
            <div className="bg-pink-600 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-white text-lg">💬</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Üzenetek</h3>
              <p className="text-sm text-gray-600">Kommunikáció</p>
            </div>
          </button>
        </div>
      </div>

      {/* Könyvelési program promó */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">💼 Könyvelési program</h3>
            <p className="text-green-700 text-sm mb-4">
              5 online fizetés után elérhető lesz az ingyenes könyvelési programunk!
            </p>
            <div className="flex items-center space-x-2">
              <div className="bg-green-200 rounded-full h-3 w-24">
                <div className="bg-green-600 h-3 rounded-full" style={{ width: '20%' }}></div>
              </div>
              <span className="text-sm text-green-700">1/5 fizetés</span>
            </div>
          </div>
          <div className="text-4xl">💰</div>
        </div>
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
    </div>
  );

  // Ügyfél Dashboard
  const ClientDashboard = () => (
    <div className="space-y-8">
      {/* Alert Messages */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {message.type === 'success' ? '✅' : '❌'}
            </span>
            {message.text}
          </div>
        </div>
      )}

      {/* Üdvözlő szekció profilkép feltöltéssel */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              Üdvözöljük, {userProfile?.firstName || user?.firstName}! 👋
            </h1>
            <p className="text-green-100 text-lg">
              Ügyfél dashboard - Itt követheti foglalásait és kedvenc szolgáltatóit
            </p>
          </div>
          
          {/* Profilkép feltöltő */}
          <div className="flex flex-col items-center space-y-3 ml-8">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white bg-opacity-20 flex items-center justify-center border-3 border-white border-opacity-30">
              {userProfile?.profileImage || user?.profileImage ? (
                <img 
                  src={userProfile?.profileImage || user?.profileImage} 
                  alt="Profilkép" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl text-white">
                  {(userProfile?.firstName || user?.firstName)?.[0]?.toUpperCase() || '👤'}
                </span>
              )}
            </div>
            
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
              <span className="cursor-pointer inline-flex items-center px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-xs font-medium text-white hover:bg-opacity-30 disabled:opacity-50 transition-all">
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Feltöltés...
                  </>
                ) : (
                  <>📷 Kép</>
                )}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Statisztika kártyák */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Foglalásaim</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Kedvenc szolgáltatók</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalFavorites}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <span className="text-2xl">❤️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Üzenetek</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalMessages}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-2xl">💬</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gyors műveletek */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">🚀 Gyors műveletek</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/services')}
            className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
          >
            <div className="bg-blue-600 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-white text-lg">🔍</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Szolgáltatók keresése</h3>
              <p className="text-sm text-gray-600">Böngészés és keresés</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/bookings')}
            className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
          >
            <div className="bg-green-600 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-white text-lg">📅</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Foglalásaim</h3>
              <p className="text-sm text-gray-600">Aktív és korábbi</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/favorites')}
            className="flex items-center p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg hover:from-red-100 hover:to-red-200 transition-all duration-200 group"
          >
            <div className="bg-red-600 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-white text-lg">❤️</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Kedvencek</h3>
              <p className="text-sm text-gray-600">Mentett szolgáltatók</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/messages')}
            className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg hover:from-yellow-100 hover:to-yellow-200 transition-all duration-200 group"
          >
            <div className="bg-yellow-600 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-white text-lg">💬</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Üzenetek</h3>
              <p className="text-sm text-gray-600">Kommunikáció</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/ai-chat')}
            className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 group"
          >
            <div className="bg-indigo-600 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-white text-lg">🤖</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">AI Asszisztens</h3>
              <p className="text-sm text-gray-600">Segítség keresése</p>
            </div>
          </button>
        </div>
      </div>

      {/* Szolgáltatóvá válás promó */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-100 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Szeretnél szolgáltatóvá válni?</h3>
            <p className="text-blue-700 text-sm mb-4">
              Csatlakozz a Corvus szolgáltatói közösségéhez és kínáld szolgáltatásaidat!
            </p>
            <button 
              onClick={() => navigate('/become-provider')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Szolgáltatóvá válás
            </button>
          </div>
          <div className="text-4xl">🚀</div>
        </div>
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

    </div>
    
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 navbar-padding">
        <Navbar />
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 navbar-padding">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.userType === 'service_provider' ? <ServiceProviderDashboard /> : <ClientDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;