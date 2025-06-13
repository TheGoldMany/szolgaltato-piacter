import React, { useState, useEffect } from 'react';
import { profileService, ProfileData } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import Layout from '../layout/Layout';
import Container from '../layout/Container';
import Card from '../common/Card';

const ProfileEditor: React.FC = () => {
  const { user } = useAuth();
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

  if (user?.userType !== 'service_provider') {
    return (
      <Layout>
        <Container className="py-20">
          <Card className="text-center max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Hozzáférés megtagadva</h2>
            <p>Csak szolgáltatók szerkeszthetik profiljaikat.</p>
          </Card>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {hasExistingProfile ? 'Profil szerkesztése' : 'Új profil létrehozása'}
            </h1>
            <p className="text-gray-600">
              Mutatkozz be a legjobb oldaladról! Ez a profil lesz látható az ügyfelek számára.
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <Card className="mb-6 bg-green-50 border-green-200">
              <div className="text-green-800">{success}</div>
            </Card>
          )}

          {error && (
            <Card className="mb-6 bg-red-50 border-red-200">
              <div className="text-red-800">{error}</div>
            </Card>
          )}

          {/* Profile Form */}
          <Card>
            <form onSubmit={handleSubmit}>
              
              {/* Basic Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Alapadatok</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label htmlFor="businessName" className="form-label">
                      Vállalkozás neve *
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={profile.businessName}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      placeholder="pl. Kovács János Kft."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="priceCategory" className="form-label">
                      Árkategória
                    </label>
                    <select
                      id="priceCategory"
                      name="priceCategory"
                      value={profile.priceCategory}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="budget">Kedvező árak</option>
                      <option value="mid">Közepes árak</option>
                      <option value="premium">Prémium árak</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Bemutatkozás
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={profile.description}
                    onChange={handleInputChange}
                    className="input-field min-h-[120px] resize-y"
                    placeholder="Mutatkozz be! Írd le tapasztalataidat, szolgáltatásaidat és azt, hogy miért téged válasszanak..."
                    rows={5}
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Helyszín</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label htmlFor="locationCity" className="form-label">
                      Város
                    </label>
                    <input
                      type="text"
                      id="locationCity"
                      name="locationCity"
                      value={profile.locationCity}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="pl. Budapest"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="locationAddress" className="form-label">
                      Cím (opcionális)
                    </label>
                    <input
                      type="text"
                      id="locationAddress"
                      name="locationAddress"
                      value={profile.locationAddress}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="pl. Budapest, V. kerület"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Kapcsolat</h2>
                
                <div className="form-group">
                  <label htmlFor="website" className="form-label">
                    Weboldal (opcionális)
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={profile.website}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>

              {/* Future Sections - Placeholder */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Képek és média</h2>
                <Card className="bg-gray-50 text-center" padding="lg">
                  <div className="text-4xl mb-4">📸</div>
                  <h3 className="text-lg font-medium mb-2">Képfeltöltés (hamarosan)</h3>
                  <p className="text-gray-600">
                    Itt tudsz majd profilképet, borítóképet és munkáid képeit feltölteni.
                  </p>
                </Card>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Moduláris profil szerkesztő</h2>
                <Card className="bg-blue-50 text-center" padding="lg">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="text-lg font-medium mb-2">Drag & Drop szerkesztő (hamarosan)</h3>
                  <p className="text-gray-600">
                    Itt tudsz majd egy 4x8-as rácsban modulokat elhelyezni és személyre szabni a profilodat.
                  </p>
                </Card>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary px-8"
                >
                  {isLoading 
                    ? 'Mentés...' 
                    : hasExistingProfile 
                      ? 'Profil frissítése' 
                      : 'Profil létrehozása'
                  }
                </button>
              </div>
            </form>
          </Card>

          {/* Help Section */}
          <Card className="mt-8 bg-yellow-50 border-yellow-200">
            <h3 className="text-lg font-semibold mb-2 text-yellow-800">💡 Tippek a jobb profilhoz</h3>
            <ul className="text-yellow-700 space-y-1">
              <li>• Adj meg részletes bemutatkozást a tapasztalataidról</li>
              <li>• Töltsd fel minőségi képeket a munkáidról</li>
              <li>• Légy pontos a helyszín megadásában</li>
              <li>• Frissítsd rendszeresen a profilodat</li>
            </ul>
          </Card>

        </div>
      </Container>
    </Layout>
  );
};

export default ProfileEditor;