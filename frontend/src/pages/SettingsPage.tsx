// frontend/src/pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

interface SettingsData {
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsData, setSettingsData] = useState<SettingsData>({
    firstName: '',
    lastName: '',
    email: '',
    profileImage: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load user data from database
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        const data = await response.json();
        if (data.success) {
          setUserProfile(data.user);
          
          // Update settings data with loaded profile
          setSettingsData({
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            email: data.user.email || '',
            profileImage: data.user.profileImage || ''
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveBasicInfo = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          firstName: settingsData.firstName,
          lastName: settingsData.lastName
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update user context
        if (updateUser) {
          updateUser({
            ...user!,
            firstName: settingsData.firstName,
            lastName: settingsData.lastName
          });
        }

        // Update local profile state
        setUserProfile((prev: any) => ({
          ...prev,
          firstName: settingsData.firstName,
          lastName: settingsData.lastName
        }));

        setMessage({ type: 'success', text: 'Alapadatok sikeresen frissítve!' });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Hiba történt a mentés során' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Hiba történt a mentés során' });
    } finally {
      setIsSaving(false);
    }
  };

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

    // ✅ JAVÍTOTT: API URL környezeti változóból
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/upload/profile-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      // Update all relevant states
      setSettingsData(prev => ({
        ...prev,
        profileImage: data.imageUrl
      }));

      setUserProfile((prev: any) => ({
        ...prev,
        profileImage: data.imageUrl
      }));

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

const handleRemoveImage = async () => {
  setIsUploading(true);
  setMessage(null);

  try {
    // ✅ JAVÍTOTT: API URL környezeti változóból
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/upload/profile-image`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    const data = await response.json();

    if (data.success) {
      // Update all relevant states
      setSettingsData(prev => ({
        ...prev,
        profileImage: ''
      }));

      setUserProfile((prev: any) => ({
        ...prev,
        profileImage: ''
      }));

      if (updateUser) {
        updateUser({
          ...user!,
          profileImage: ''
        });
      }

      setMessage({ type: 'success', text: 'Profilkép sikeresen eltávolítva!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: data.error || 'Hiba történt a kép törlése során' });
    }
  } catch (error) {
    console.error('Error removing image:', error);
    setMessage({ type: 'error', text: 'Hiba történt a kép törlése során' });
  } finally {
    setIsUploading(false);
  }
};
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ⚙️ Beállítások
          </h1>
          <p className="text-gray-600">
            Fiók beállításainak kezelése és személyes információk szerkesztése.
          </p>
        </div>

        {/* Alert Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">📷 Profilkép</h2>
              
              <div className="flex flex-col items-center space-y-4">
                {/* Profile Image Display */}
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-gray-100">
                  {settingsData.profileImage ? (
                    <img 
                      src={settingsData.profileImage} 
                      alt="Profilkép" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-gray-400">
                      {settingsData.firstName?.[0]?.toUpperCase() || '👤'}
                    </span>
                  )}
                </div>
                
                {/* Upload/Remove Buttons */}
                <div className="flex flex-col space-y-2 w-full">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <span className="cursor-pointer w-full inline-flex justify-center items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 transition-colors">
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Feltöltés...
                        </>
                      ) : (
                        <>📷 Kép feltöltése</>
                      )}
                    </span>
                  </label>

                  {settingsData.profileImage && (
                    <button
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                      className="w-full px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                      🗑️ Kép eltávolítása
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Max 5MB méret<br />
                  JPG, PNG formátum
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">👤 Alapinformációk</h2>
              
              <div className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keresztnév
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={settingsData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="János"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vezetéknév
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={settingsData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Kovács"
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email cím
                  </label>
                  <input
                    type="email"
                    value={settingsData.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    placeholder="email@example.com"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Az email cím nem módosítható
                  </p>
                </div>

                {/* Account Type Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiók típusa
                  </label>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user?.userType === 'service_provider' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user?.userType === 'service_provider' ? '🔧 Szolgáltató' : '👤 Ügyfél'}
                    </span>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveBasicInfo}
                    disabled={isSaving}
                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Mentés...
                      </>
                    ) : (
                      <>💾 Mentés</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">🔧 További beállítások</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">🔔 Értesítések</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Email és push értesítések kezelése
                </p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Hamarosan elérhető
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">🔒 Biztonság</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Jelszó változtatás és kétfaktoros hitelesítés
                </p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Hamarosan elérhető
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">🌐 Nyelv és régió</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Nyelvi és területi beállítások
                </p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Hamarosan elérhető
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">📊 Adatkezelés</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Adatok letöltése és fiók törlése
                </p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Hamarosan elérhető
                </button>
              </div>
            </div>
          </div>
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
};

export default SettingsPage;