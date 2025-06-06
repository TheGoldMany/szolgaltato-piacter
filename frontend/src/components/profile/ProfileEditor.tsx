import React, { useState, useEffect } from 'react';
import { profileService, ProfileData } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';

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
      <div className="card text-center">
        <h2 className="text-xl font-bold mb-4">Hozzáférés megtagadva</h2>
        <p>Csak szolgáltatók szerkeszthetik profiljaikat.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl" style={{margin: '0 auto'}}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {hasExistingProfile ? 'Profil szerkesztése' : 'Új profil létrehozása'}
        </h1>
        <p className="text-gray-600">
          Mutatkozz be a legjobb oldaladról! Ez a profil lesz látható az ügyfelek számára.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">👤 Alapadatok</h3>
          
          <div className="space-y-4">
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
                placeholder="pl. Kovács Péter Grafikai Stúdió"
              />
            </div>

            <div className="form-group">
              <label htmlFor="priceCategory" className="form-label">
                Árkategória *
              </label>
              <select
                id="priceCategory"
                name="priceCategory"
                value={profile.priceCategory}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="budget">💰 Kedvező árak</option>
                <option value="mid">💎 Közepes árak</option>
                <option value="premium">⭐ Prémium árak</option>
              </select>
            </div>

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
                placeholder="https://www.pelda.hu"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">📝 Bemutatkozás</h3>
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Írj magadról és szolgáltatásaidról *
            </label>
            <textarea
              id="description"
              name="description"
              value={profile.description}
              onChange={handleInputChange}
              className="input-field"
              required
              rows={6}
              placeholder="Bemutatkozás, tapasztalat, szolgáltatások részletezése..."
              style={{resize: 'vertical'}}
            />
            <div className="text-sm text-gray-600 mt-1">
              {profile.description.length}/1000 karakter
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">📍 Helyszín</h3>
          <div className="grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <div className="form-group">
              <label htmlFor="locationCity" className="form-label">
                Város *
              </label>
              <input
                type="text"
                id="locationCity"
                name="locationCity"
                value={profile.locationCity}
                onChange={handleInputChange}
                className="input-field"
                required
                placeholder="Budapest"
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
                placeholder="1056 Budapest, Váci utca 123."
              />
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 text-red-600 text-sm" style={{backgroundColor: '#fef2f2', borderRadius: '8px'}}>
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 text-green-600 text-sm" style={{backgroundColor: '#f0fdf4', borderRadius: '8px'}}>
            {success}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.history.back()}
          >
            Mégse
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading 
              ? 'Mentés...' 
              : hasExistingProfile 
                ? 'Módosítások mentése' 
                : 'Profil létrehozása'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditor;