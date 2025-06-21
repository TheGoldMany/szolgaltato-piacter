// frontend/src/components/profile/ProfileEditor.tsx
// ✅ 1. FÁZIS: Backend API integráció ProfileEditor-hez

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';

interface ProfileData {
  businessName: string;
  description: string;
  locationCity: string;
  locationAddress: string;
  priceCategory: 'budget' | 'mid' | 'premium' | '';
  priceRangeMin: string;
  priceRangeMax: string;
  contactPhone: string;
  contactEmail: string;
  availabilityHours: string;
  specializations: string[];
  profileImageUrl: string;
}

const ProfileEditor: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // ✅ Backend integráció state-ek
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    businessName: '',
    description: '',
    locationCity: '',
    locationAddress: '',
    priceCategory: '',
    priceRangeMin: '',
    priceRangeMax: '',
    contactPhone: '',
    contactEmail: '',
    availabilityHours: '',
    specializations: [],
    profileImageUrl: ''
  });

  const [newSpecialization, setNewSpecialization] = useState('');

  // ✅ Profile betöltése component mount-nál
  useEffect(() => {
    loadExistingProfile();
  }, []);

  // ✅ Meglévő profil betöltése backend-ről
  const loadExistingProfile = async () => {
    setIsLoadingProfile(true);
    setError(null);
    
    try {
      // ✅ JAVÍTÁS: Ugyanaz a token keresési logika, mint az authService-ben
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('Nincs érvényes bejelentkezés');
      }

      const response = await fetch('http://localhost:5000/api/users/profiles/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        // Nincs még profil létrehozva
        setHasExistingProfile(false);
        setIsLoadingProfile(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Loaded profile data:', data);
      
      if (data.success && data.data) {
        setHasExistingProfile(true);
        
        // Backend mezők mapping frontend state-hez
        setProfile({
          businessName: data.data.business_name || '',
          description: data.data.description || '',
          locationCity: data.data.location_city || '',
          locationAddress: data.data.location_address || '',
          priceCategory: data.data.price_category || '',
          priceRangeMin: '', // ❌ ELTÁVOLÍTVA
          priceRangeMax: '', // ❌ ELTÁVOLÍTVA
          contactPhone: '', // ❌ ELTÁVOLÍTVA
          contactEmail: '', // ❌ ELTÁVOLÍTVA
          availabilityHours: '', // ❌ ELTÁVOLÍTVA
          specializations: data.data.skills || [],  // ✅ skills -> specializations mapping
          profileImageUrl: data.data.profile_image_url || ''
        });
        
        setSuccess('Profil sikeresen betöltve!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error('❌ Error loading profile:', err);
      setError(`Hiba a profil betöltése során: ${err.message}`);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // ✅ Form mezők frissítése
  const handleInputChange = (field: keyof ProfileData, value: string | string[]) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Error/success üzenetek törlése user input-nál
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // ✅ Szakterület hozzáadása
  const addSpecialization = () => {
    const trimmed = newSpecialization.trim();
    if (trimmed && !profile.specializations.includes(trimmed)) {
      setProfile(prev => ({
        ...prev,
        specializations: [...prev.specializations, trimmed]
      }));
      setNewSpecialization('');
    }
  };

  // ✅ Szakterület eltávolítása
  const removeSpecialization = (index: number) => {
    setProfile(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  // ✅ Lépés validálás
  const validateStep = (step: number): boolean => {
    setError(null);
    
    switch (step) {
      case 1:
        if (!profile.businessName.trim()) {
          setError('A vállalkozás neve kötelező!');
          return false;
        }
        if (!profile.description.trim()) {
          setError('A bemutatkozás kötelező!');
          return false;
        }
        if (profile.description.trim().length < 50) {
          setError('A bemutatkozásnak legalább 50 karakter hosszúnak kell lennie!');
          return false;
        }
        return true;
        
      case 2:
        if (!profile.locationCity.trim()) {
          setError('A város megadása kötelező!');
          return false;
        }
        return true;
        
      case 3:
        // ❌ Elérhetőségi mezők validációja ELTÁVOLÍTVA
        // Mivel nincsenek a DB-ben, nem kell validálni őket
        return true;
        
      default:
        return true;
    }
  };

  // ✅ Következő lépés
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  // ✅ Előző lépés
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // ✅ Profil mentése backend-re
  const handleSaveProfile = async () => {
    // Végső validálás minden lépésre
    for (let step = 1; step <= totalSteps; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // ✅ JAVÍTÁS: Ugyanaz a token keresési logika, mint az authService-ben
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('Nincs érvényes bejelentkezés');
      }

      // Backend formátumra konvertálás
      const profileData = {
        business_name: profile.businessName.trim(),
        description: profile.description.trim(),
        location_city: profile.locationCity.trim(),
        location_address: profile.locationAddress.trim() || null,
        price_category: profile.priceCategory || null,
        skills: profile.specializations,  // ✅ specializations -> skills mapping
        profile_image_url: profile.profileImageUrl || null
      };

      console.log('💾 Mentés indítása:', profileData);

      const method = hasExistingProfile ? 'PUT' : 'POST';
      const url = hasExistingProfile ? 'http://localhost:5000/api/users/profiles/me' : 'http://localhost:5000/api/users/profiles';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Mentés sikeres:', data);

      if (data.success) {
        setHasExistingProfile(true);
        setSuccess('Profil sikeresen mentve!');
        
        // 3 másodperc után navigálás a dashboard-ra
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        throw new Error(data.error || 'Ismeretlen hiba történt');
      }
      
    } catch (err: any) {
      console.error('❌ Mentési hiba:', err);
      setError(`Hiba a profil mentése során: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Loading state initial load alatt
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Profil betöltése...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* ✅ Fejléc state alapján */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {hasExistingProfile ? '✏️ Profil Szerkesztése' : '🚀 Profil Létrehozása'}
            </h1>
            <p className="text-gray-600">
              {hasExistingProfile 
                ? 'Frissítsd a szolgáltatói profil adataidat'
                : 'Hozd létre a szolgáltatói profilodat és jelenj meg a piactéren'}
            </p>
          </div>

          {/* ✅ Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Lépés {currentStep} / {totalSteps}</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% kész</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* ✅ Error/Success üzenetek */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">❌</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-green-400">✅</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Form tartalom */}
          <div className="bg-white rounded-lg shadow-md p-6">
            
            {/* 1. lépés: Alapadatok */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Alapadatok</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vállalkozás / Szolgáltató neve *
                  </label>
                  <input
                    type="text"
                    value={profile.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="pl. Kovács János Kft."
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">{profile.businessName.length}/100 karakter</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bemutatkozás *
                  </label>
                  <textarea
                    value={profile.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Írj magadról, szolgáltatásaidról, tapasztalataidról..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {profile.description.length}/500 karakter (minimum 50 karakter szükséges)
                  </p>
                </div>
              </div>
            )}

            {/* 2. lépés: Helyszín és árazás */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📍 Helyszín és Árazás</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Város *
                  </label>
                  <input
                    type="text"
                    value={profile.locationCity}
                    onChange={(e) => handleInputChange('locationCity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="pl. Budapest"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pontos cím (opcionális)
                  </label>
                  <input
                    type="text"
                    value={profile.locationAddress}
                    onChange={(e) => handleInputChange('locationAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="pl. 1055 Budapest, Kossuth utca 1."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Árkategória
                  </label>
                  <select
                    value={profile.priceCategory}
                    onChange={(e) => handleInputChange('priceCategory', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Válassz árkategóriát...</option>
                    <option value="budget">💰 Költségvetés-barát</option>
                    <option value="mid">💎 Közepes</option>
                    <option value="premium">👑 Prémium</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum ár (Ft)
                    </label>
                    <input
                      type="number"
                      value={profile.priceRangeMin}
                      onChange={(e) => handleInputChange('priceRangeMin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="5000"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum ár (Ft)
                    </label>
                    <input
                      type="number"
                      value={profile.priceRangeMax}
                      onChange={(e) => handleInputChange('priceRangeMax', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="50000"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. lépés: Elérhetőségek */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📞 Elérhetőségek</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefonszám
                  </label>
                  <input
                    type="tel"
                    value={profile.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+36 30 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email cím
                  </label>
                  <input
                    type="email"
                    value={profile.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="kovacs.janos@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Elérhetőségi időszak
                  </label>
                  <input
                    type="text"
                    value={profile.availabilityHours}
                    onChange={(e) => handleInputChange('availabilityHours', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="H-P: 8:00-18:00, Szombat: 9:00-14:00"
                  />
                </div>

                <p className="text-sm text-gray-600 italic">
                  * Legalább egy elérhetőség megadása kötelező
                </p>
              </div>
            )}

            {/* 4. lépés: Szakterületek */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🔧 Szakterületek</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Szakterület hozzáadása
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="pl. Vízszigetelés, Festés, Burkolás..."
                    />
                    <button
                      type="button"
                      onClick={addSpecialization}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      ➕ Hozzáadás
                    </button>
                  </div>
                </div>

                {profile.specializations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Hozzáadott szakterületek:</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {spec}
                          <button
                            type="button"
                            onClick={() => removeSpecialization(index)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ✅ Navigációs gombok */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={isLoading}
                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    ← Előző
                  </button>
                )}
              </div>

              <div>
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Következő →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Mentés...
                      </>
                    ) : (
                      <>
                        💾 {hasExistingProfile ? 'Módosítások mentése' : 'Profil létrehozása'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* ✅ Hasznos linkek */}
          <div className="mt-8 text-center">
            <Link 
              to="/dashboard" 
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Vissza a Dashboard-ra
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;