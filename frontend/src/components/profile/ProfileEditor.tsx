// frontend/src/components/profile/SimpleProfileEditor.tsx
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

const SimpleProfileEditor: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const response = await fetch('/api/profiles/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setHasExistingProfile(true);
          // Populate form with existing data
          setProfile({
            businessName: data.data.business_name || '',
            description: data.data.description || '',
            locationCity: data.data.location_city || '',
            locationAddress: data.data.location_address || '',
            priceCategory: data.data.price_category || '',
            priceRangeMin: data.data.price_range_min?.toString() || '',
            priceRangeMax: data.data.price_range_max?.toString() || '',
            contactPhone: data.data.contact_phone || '',
            contactEmail: data.data.contact_email || '',
            availabilityHours: data.data.availability_hours || '',
            specializations: data.data.specializations || [],
            profileImageUrl: data.data.profile_image_url || ''
          });
        }
      }
    } catch (err) {
      console.error('Error checking existing profile:', err);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string | string[]) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !profile.specializations.includes(newSpecialization.trim())) {
      setProfile(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index: number) => {
    setProfile(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
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
        return true;
      case 2:
        if (!profile.locationCity.trim()) {
          setError('A város megadása kötelező!');
          return false;
        }
        return true;
      case 3:
        if (!profile.contactPhone.trim() && !profile.contactEmail.trim()) {
          setError('Legalább egy elérhetőség megadása kötelező!');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const profileData = {
        business_name: profile.businessName,
        description: profile.description,
        location_city: profile.locationCity,
        location_address: profile.locationAddress,
        price_category: profile.priceCategory,
        price_range_min: profile.priceRangeMin ? parseInt(profile.priceRangeMin) : null,
        price_range_max: profile.priceRangeMax ? parseInt(profile.priceRangeMax) : null,
        contact_phone: profile.contactPhone,
        contact_email: profile.contactEmail,
        availability_hours: profile.availabilityHours,
        specializations: profile.specializations,
        profile_image_url: profile.profileImageUrl
      };

      const method = hasExistingProfile ? 'PUT' : 'POST';
      const url = hasExistingProfile ? '/api/profiles/me' : '/api/profiles';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Hiba történt a mentés során');
      }

      if (hasExistingProfile) {
        setSuccess('Profil sikeresen frissítve! ✅');
      } else {
        setSuccess('Profil sikeresen létrehozva! 🎉');
        setHasExistingProfile(true);
      }
      
      // Redirect to profile view after 2 seconds
      setTimeout(() => {
        navigate(`/profile/${data.data.id}`);
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'Hiba történt a mentés során');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
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
      2: 'Helyszín és árazás',
      3: 'Kapcsolat és elérhetőség',
      4: 'Előnézet és mentés'
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
                    Állítsd be a profilodat, hogy az ügyfelek megtaláljanak!
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-8 py-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {currentStep}. lépés: {getStepTitle(currentStep)}
                </span>
                <span className="text-sm text-gray-500">
                  {currentStep} / {totalSteps}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
              
              {/* Step Navigator */}
              <div className="flex justify-center mt-4 space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <button
                    key={step}
                    onClick={() => goToStep(step)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      step === currentStep
                        ? 'bg-blue-600 text-white'
                        : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step < currentStep ? '✓' : step}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="px-8 py-8">
              {/* Error and Success Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-red-600 text-xl mr-3">⚠️</span>
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-600 text-xl mr-3">✅</span>
                    <span className="text-green-700">{success}</span>
                  </div>
                </div>
              )}

              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Alapadatok</h2>
                    <p className="text-gray-600">Add meg a vállalkozásod alapvető információit</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vállalkozás neve *
                    </label>
                    <input
                      type="text"
                      value={profile.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="pl. Kovács Kft. - Vízvezeték szerelés"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bemutatkozás *
                    </label>
                    <textarea
                      value={profile.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Mutatkozz be! Mit csinálsz, milyen tapasztalataid vannak, miért válasszanak téged?"
                      maxLength={1000}
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {profile.description.length}/1000
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Szakterületek
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="pl. Vízvezeték szerelés"
                      />
                      <button
                        type="button"
                        onClick={addSpecialization}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Hozzáad
                      </button>
                    </div>
                    {profile.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {profile.specializations.map((spec, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {spec}
                            <button
                              type="button"
                              onClick={() => removeSpecialization(index)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Location and Pricing */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Helyszín és árazás</h2>
                    <p className="text-gray-600">Add meg a szolgáltatásod helyszínét és árait</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Város *
                      </label>
                      <input
                        type="text"
                        value={profile.locationCity}
                        onChange={(e) => handleInputChange('locationCity', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="pl. Budapest"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cím (opcionális)
                      </label>
                      <input
                        type="text"
                        value={profile.locationAddress}
                        onChange={(e) => handleInputChange('locationAddress', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="pl. V. kerület"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Árkategória
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { value: 'budget', label: 'Kedvező árak', icon: '💚', desc: 'Gazdaságos megoldások' },
                        { value: 'mid', label: 'Közepes árak', icon: '💛', desc: 'Ár-érték arány' },
                        { value: 'premium', label: 'Prémium árak', icon: '💜', desc: 'Magas minőség' }
                      ].map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => handleInputChange('priceCategory', category.value)}
                          className={`p-4 border-2 rounded-lg text-center transition-all ${
                            profile.priceCategory === category.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">{category.icon}</div>
                          <div className="font-medium text-gray-900">{category.label}</div>
                          <div className="text-sm text-gray-600">{category.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum ár (Ft)
                      </label>
                      <input
                        type="number"
                        value={profile.priceRangeMin}
                        onChange={(e) => handleInputChange('priceRangeMin', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="50000"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Elérhetőségi idő
                    </label>
                    <input
                      type="text"
                      value={profile.availabilityHours}
                      onChange={(e) => handleInputChange('availabilityHours', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="pl. Hétfő-Péntek 8:00-18:00, Hétvégén megbeszélés szerint"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Contact Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Kapcsolat és elérhetőség</h2>
                    <p className="text-gray-600">Add meg az elérhetőségeidet</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefonszám
                      </label>
                      <input
                        type="tel"
                        value={profile.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+36 30 123 4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail cím
                      </label>
                      <input
                        type="email"
                        value={profile.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="szolgaltato@email.com"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-600 text-xl">💡</div>
                      <div>
                        <h3 className="font-medium text-blue-900 mb-2">Tipp az elérhetőségekhez</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Legalább egy elérhetőség megadása kötelező</li>
                          <li>• A telefonszám gyorsabb kapcsolatfelvételt tesz lehetővé</li>
                          <li>• Az e-mail cím hosszabb üzenetek küldésére alkalmas</li>
                          <li>• A platformon keresztül is tudnak majd írni az ügyfelek</li>
                        </ul>
                      </div>
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                          {profile.businessName.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{profile.businessName || 'Vállalkozás neve'}</h3>
                          <p className="text-blue-100">📍 {profile.locationCity || 'Város'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">📋 Bemutatkozás:</h4>
                        <p className="text-gray-600">
                          {profile.description || 'Itt lesz a bemutatkozásod...'}
                        </p>
                      </div>

                      {profile.specializations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">🎯 Szakterületek:</h4>
                          <div className="flex flex-wrap gap-2">
                            {profile.specializations.map((spec, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">📍 Helyszín:</h4>
                          <p className="text-gray-600">
                            {profile.locationCity || 'Város'}
                            {profile.locationAddress && `, ${profile.locationAddress}`}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">💰 Árazás:</h4>
                          <div className="space-y-1">
                            {profile.priceCategory && (
                              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                                profile.priceCategory === 'budget' ? 'bg-green-100 text-green-800' :
                                profile.priceCategory === 'mid' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {profile.priceCategory === 'budget' ? 'Kedvező árak' :
                                 profile.priceCategory === 'mid' ? 'Közepes árak' : 'Prémium árak'}
                              </span>
                            )}
                            {profile.priceRangeMin && profile.priceRangeMax && (
                              <p className="text-gray-600">
                                {parseInt(profile.priceRangeMin).toLocaleString()} - {parseInt(profile.priceRangeMax).toLocaleString()} Ft
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">📞 Elérhetőségek:</h4>
                          <div className="space-y-1">
                            {profile.contactPhone && (
                              <p className="text-gray-600">📱 {profile.contactPhone}</p>
                            )}
                            {profile.contactEmail && (
                              <p className="text-gray-600">✉️ {profile.contactEmail}</p>
                            )}
                          </div>
                        </div>

                        {profile.availabilityHours && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">🕒 Elérhetőség:</h4>
                            <p className="text-gray-600">{profile.availabilityHours}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <div className="text-green-600 text-xl">✨</div>
                      <div>
                        <h3 className="font-medium text-green-900 mb-2">Profil kész a mentésre!</h3>
                        <p className="text-sm text-green-800">
                          Ha minden rendben van, kattints a "Profil mentése" gombra. 
                          Később bármikor visszatérhetsz és módosíthatod az adataidat.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ← Előző
                </button>

                <div className="text-sm text-gray-500">
                  {currentStep} / {totalSteps}
                </div>

                {currentStep < totalSteps ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Következő →
                  </button>
                ) : (
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      isLoading
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Mentés...
                      </span>
                    ) : (
                      hasExistingProfile ? 'Módosítások mentése ✅' : 'Profil mentése 🎉'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleProfileEditor;