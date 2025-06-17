// frontend/src/components/profile/ProfileEditor.tsx
import React, { useState, useEffect } from 'react';
import { profileService, ProfileData } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../layout/Navbar';

const ProfileEditor: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<ProfileData>({
    businessName: '',
    description: '',
    locationCity: '',
    locationAddress: '',
    priceCategory: 'mid',
    website: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const existingProfile = await profileService.getMyProfile();
      setProfile({
        businessName: existingProfile.businessName || '',
        description: existingProfile.description || '',
        locationCity: existingProfile.locationCity || '',
        locationAddress: existingProfile.locationAddress || '',
        priceCategory: existingProfile.priceCategory || 'mid',
        website: existingProfile.website || ''
      });
      setHasExistingProfile(true);
    } catch (error: any) {
      // No existing profile - that's OK for new service providers
      if (error.response?.status !== 404) {
        setError('Hiba a profil betöltése során');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (hasExistingProfile) {
        await profileService.updateProfile(profile);
        setSuccess('Profil sikeresen frissítve! ✅');
      } else {
        await profileService.createProfile(profile);
        setSuccess('Profil sikeresen létrehozva! 🎉');
        setHasExistingProfile(true);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Hiba történt a mentés során');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const getStepTitle = (step: number) => {
    const titles = {
      1: 'Alapadatok',
      2: 'Helyszín',
      3: 'Kapcsolat',
      4: 'Előnézet'
    };
    return titles[step as keyof typeof titles];
  };

  if (user?.userType !== 'service_provider') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 navbar-padding">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center py-20 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hozzáférés megtagadva</h2>
            <p className="text-gray-600 mb-6">Csak szolgáltatók szerkeszthetik profiljaikat.</p>
            <Link 
              to="/dashboard" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Vissza a Dashboard-ra
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 navbar-padding">
      <Navbar />
      
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Profile Editor Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            
            {/* Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl mb-2">🛠️</div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">
                    {hasExistingProfile ? 'Profil szerkesztése' : 'Új profil létrehozása'}
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Mutatkozz be a legjobb oldaladról! Ez a profil lesz látható az ügyfelek számára.
                  </p>
                </div>
                <div className="hidden md:block text-right">
                  <div className="text-sm opacity-80">Lépés</div>
                  <div className="text-2xl font-bold">{currentStep}/{totalSteps}</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-8 py-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {getStepTitle(currentStep)}
                </span>
                <span className="text-sm text-gray-500">{currentStep}/{totalSteps}</span>
              </div>
              
              {/* Progress Indicators */}
              <div className="flex items-center space-x-2 mb-3">
                {[1, 2, 3, 4].map((step) => (
                  <button
                    key={step}
                    onClick={() => goToStep(step)}
                    className={`w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                      step <= currentStep 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              
              {/* Success/Error Messages */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-green-600 text-xl mr-3">✅</span>
                    <p className="text-green-800 font-medium">{success}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-red-600 text-xl mr-3">❌</span>
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Alapadatok megadása</h2>
                      <p className="text-gray-600">Add meg a vállalkozásod alapvető információit</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vállalkozás neve *
                        </label>
                        <input
                          type="text"
                          name="businessName"
                          value={profile.businessName}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                          placeholder="pl. Kovács János Kft."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Árkategória
                        </label>
                        <select
                          name="priceCategory"
                          value={profile.priceCategory}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="budget">💰 Kedvező árak</option>
                          <option value="mid">💰💰 Közepes árak</option>
                          <option value="premium">💰💰💰 Prémium árak</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bemutatkozás
                      </label>
                      <textarea
                        name="description"
                        value={profile.description}
                        onChange={handleInputChange}
                        className="input-field min-h-[120px] resize-y"
                        placeholder="Mutatkozz be! Írd le tapasztalataidat, szolgáltatásaidat és azt, hogy miért téged válasszanak..."
                        rows={6}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {profile.description.length}/500 karakter
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Location Information */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Helyszín megadása</h2>
                      <p className="text-gray-600">Hol találhatóak a szolgáltatásaid?</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Város
                        </label>
                        <input
                          type="text"
                          name="locationCity"
                          value={profile.locationCity}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="pl. Budapest"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cím (opcionális)
                        </label>
                        <input
                          type="text"
                          name="locationAddress"
                          value={profile.locationAddress}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="pl. Budapest, V. kerület"
                        />
                      </div>
                    </div>

                    {/* Location Tips */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-2">💡 Helyszín tippek</h3>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Add meg a várost, ahol dolgozol</li>
                        <li>• Ha több városban is szolgáltat, add meg a fő helyszínt</li>
                        <li>• A pontos címet csak akkor add meg, ha szükséges</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Step 3: Contact Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Kapcsolati információk</h2>
                      <p className="text-gray-600">Hogyan érhetnek el téged az ügyfelek?</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weboldal (opcionális)
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={profile.website}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="https://www.example.com"
                      />
                    </div>

                    {/* Future Sections - Placeholder */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <div className="text-4xl mb-4">📸</div>
                        <h3 className="text-lg font-medium mb-2">Képfeltöltés (hamarosan)</h3>
                        <p className="text-gray-600">
                          Itt tudsz majd profilképet, borítóképet és munkáid képeit feltölteni.
                        </p>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-6 text-center">
                        <div className="text-4xl mb-4">🎨</div>
                        <h3 className="text-lg font-medium mb-2">Moduláris profil szerkesztő (hamarosan)</h3>
                        <p className="text-gray-600">
                          Itt tudsz majd egy 4x8-as rácsban modulokat elhelyezni és személyre szabni a profilodat.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Preview */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Profil előnézet</h2>
                      <p className="text-gray-600">Így fogják látni az ügyfelek a profilodat</p>
                    </div>

                    {/* Profile Preview Card */}
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-4">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold mr-4">
                            {profile.businessName.charAt(0) || '?'}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{profile.businessName || 'Vállalkozás neve'}</h3>
                            <p className="text-blue-100">{profile.locationCity || 'Város'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Bemutatkozás:</h4>
                          <p className="text-gray-600">
                            {profile.description || 'Itt lesz a bemutatkozásod...'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            📍 {profile.locationCity || 'Város'}
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            💰 {profile.priceCategory === 'budget' ? 'Kedvező' : 
                                 profile.priceCategory === 'mid' ? 'Közepes' : 'Prémium'} árak
                          </span>
                          {profile.website && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                              🌐 Weboldal
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-medium text-yellow-800 mb-2">💡 Tippek a jobb profilhoz</h3>
                      <ul className="text-yellow-700 text-sm space-y-1">
                        <li>• Adj meg részletes bemutatkozást a tapasztalataidról</li>
                        <li>• Töltsd fel minőségi képeket a munkáidról (hamarosan)</li>
                        <li>• Légy pontos a helyszín megadásában</li>
                        <li>• Frissítsd rendszeresen a profilodat</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        ← Előző
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Következő →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary px-8"
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Mentés...
                          </div>
                        ) : (
                          hasExistingProfile ? 'Profil frissítése' : 'Profil létrehozása'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Kérdésed van a profil szerkesztéssel kapcsolatban?{' '}
                <Link to="/help" className="text-blue-600 hover:text-blue-800 font-medium">
                  Súgó központ
                </Link>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex justify-center space-x-4">
            <Link 
              to="/dashboard" 
              className="px-4 py-2 text-white hover:text-blue-200 transition-colors"
            >
              ← Vissza a Dashboard-ra
            </Link>
            {hasExistingProfile && (
              <Link 
                to={`/profile/${user?.id}`} 
                className="px-4 py-2 text-white hover:text-blue-200 transition-colors"
              >
                Profil megtekintése →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;