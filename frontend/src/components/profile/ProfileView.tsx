import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import Container from '../layout/Container';
import Card from '../common/Card';
import Loading from '../common/Loading';

// Interfaces maradnak ugyanazok...
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
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container className="py-20">
          <Loading size="lg" text="Profil betöltése..." />
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container className="py-20">
          <Card className="text-center">
            <div className="text-red-600 text-xl mb-4">❌ {error}</div>
            <button 
              onClick={handleBackClick}
              className="btn btn-primary"
            >
              Vissza
            </button>
          </Card>
        </Container>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <Container className="py-20">
          <Card className="text-center">
            <div className="text-gray-600 text-xl mb-4">Profil nem található</div>
            <button 
              onClick={handleBackClick}
              className="btn btn-primary"
            >
              Vissza
            </button>
          </Card>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="py-8">
        
        {/* Back Button */}
        <button 
          onClick={handleBackClick}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Vissza
        </button>

        {/* Profile Header */}
        <Card className="overflow-hidden mb-8" padding="sm">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative -mx-4 -mt-4 mb-4">
            {profile.cover_image_url ? (
              <img 
                src={profile.cover_image_url} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-2xl font-bold">
                  {profile.business_name.charAt(0)}
                </div>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-4">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
              
              {/* Profile Image */}
              <div className="flex-shrink-0 mb-4 md:mb-0">
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-4 border-white -mt-12 relative">
                  {profile.profile_image_url ? (
                    <img 
                      src={profile.profile_image_url} 
                      alt={profile.business_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {profile.business_name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.business_name}
                </h1>
                
                <div className="text-lg text-gray-600 mb-4">
                  {profile.first_name} {profile.last_name}
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {profile.location_city && (
                    <span className="flex items-center text-gray-600">
                      📍 {profile.location_city}
                    </span>
                  )}
                  
                  {parseFloat(profile.rating_average) > 0 && (
                    <span className="flex items-center text-yellow-600">
                      ⭐ {parseFloat(profile.rating_average).toFixed(1)} ({profile.rating_count} értékelés)
                    </span>
                  )}
                  
                  {profile.price_category && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriceCategoryColor(profile.price_category)}`}>
                      {getPriceCategoryLabel(profile.price_category)} árak
                    </span>
                  )}
                </div>

                {/* Categories */}
                {profile.categories && profile.categories.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">Szolgáltatási területek:</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.categories.map((category) => (
                        <span 
                          key={category.id}
                          className={`px-3 py-1 rounded-full text-sm ${
                            category.is_primary ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
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
                    className="btn btn-primary"
                  >
                    ✉️ Kapcsolatfelvétel
                  </button>
                  
                  {profile.phone && (
                    <button
                      onClick={handlePhoneClick}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors"
                    >
                      📞 {profile.phone}
                    </button>
                  )}
                  
                  {profile.website && (
                    <button
                      onClick={handleWebsiteClick}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 flex items-center transition-colors"
                    >
                      🌐 Weboldal
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Description */}
        {profile.description && (
          <Card className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bemutatkozás</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {profile.description}
            </p>
          </Card>
        )}

        {/* Additional Info */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">További információk</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong className="text-gray-900">Státusz:</strong>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                profile.availability_status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {profile.availability_status === 'available' ? 'Elérhető' : 'Nem elérhető'}
              </span>
            </div>
            
            {profile.location_address && (
              <div>
                <strong className="text-gray-900">Cím:</strong>
                <span className="ml-2 text-gray-700">{profile.location_address}</span>
              </div>
            )}
            
            <div>
              <strong className="text-gray-900">Regisztráció:</strong>
              <span className="ml-2 text-gray-700">
                {new Date(profile.created_at).toLocaleDateString('hu-HU')}
              </span>
            </div>
            
            <div>
              <strong className="text-gray-900">Utolsó frissítés:</strong>
              <span className="ml-2 text-gray-700">
                {new Date(profile.updated_at).toLocaleDateString('hu-HU')}
              </span>
            </div>
          </div>
        </Card>

      </Container>
    </Layout>
  );
};

export default ProfileView;