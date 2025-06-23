// frontend/src/components/profile/ProfileView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';

// ✅ JAVÍTOTT INTERFACE - Backend válasz alapján
interface ServiceProfile {
  id: number;
  business_name: string;
  description: string;
  profile_image_url?: string;
  cover_image_url?: string;
  location_city: string;
  location_address?: string;
  price_category?: string;
  rating_average: number;
  rating_count: number;
  website?: string;
  availability_status?: string;
  first_name: string;        
  last_name: string;         
  email: string;             
  specializations?: string[];
  services?: Array<{         
    id: number;
    title: string;
    description?: string;
    base_price: number;
    price_unit: string;
    category: string;
  }>;
  modules?: Array<{
    id: number;
    module_type: string;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    content: any;
    is_visible: boolean;
    sort_order: number;
  }>;
}

// Modulok renderelési komponensei
const ModuleRenderers = {
  text: ({ content }: { content: any }) => (
    <div className="prose max-w-none">
      <div 
        className={`text-${content.size || 'base'} text-${content.color || 'gray-700'}`}
        style={{ backgroundColor: content.backgroundColor || 'transparent' }}
      >
        {content.text || content.description || 'Szöveges tartalom'}
      </div>
    </div>
  ),

  hero: ({ content }: { content: any }) => (
    <div className="relative overflow-hidden rounded-lg">
      {content.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${content.backgroundImage})` }}
        />
      )}
      <div className="relative p-6 text-center" style={{ backgroundColor: content.backgroundColor || 'rgba(59, 130, 246, 0.9)' }}>
        <h2 className="text-2xl font-bold text-white mb-2">{content.title || 'Hero Szekció'}</h2>
        <p className="text-white/90">{content.subtitle || content.description}</p>
        {content.buttonText && (
          <button className="mt-4 px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            {content.buttonText}
          </button>
        )}
      </div>
    </div>
  ),

  image: ({ content }: { content: any }) => (
    <div className="relative overflow-hidden rounded-lg">
      <img
        src={content.imageUrl || content.url || '/api/placeholder/400/300'}
        alt={content.alt || content.caption || 'Kép'}
        className="w-full h-full object-cover"
        style={{ aspectRatio: content.aspectRatio || 'auto' }}
      />
      {content.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
          {content.caption}
        </div>
      )}
    </div>
  ),

  gallery: ({ content }: { content: any }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">📸 Galéria</h3>
      <div className="grid grid-cols-2 gap-2">
        {(content.images || []).slice(0, 4).map((image: any, index: number) => (
          <img
            key={index}
            src={image.url || image}
            alt={image.alt || `Galéria kép ${index + 1}`}
            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
          />
        ))}
        {(content.images || []).length > 4 && (
          <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            +{(content.images || []).length - 4} további
          </div>
        )}
      </div>
    </div>
  ),

  video: ({ content }: { content: any }) => (
    <div className="relative overflow-hidden rounded-lg">
      {content.videoType === 'youtube' && content.youtubeId ? (
        <iframe
          src={`https://www.youtube.com/embed/${content.youtubeId}`}
          className="w-full h-full min-h-[200px]"
          frameBorder="0"
          allowFullScreen
          title={content.title || 'Video'}
        />
      ) : content.videoType === 'vimeo' && content.vimeoId ? (
        <iframe
          src={`https://player.vimeo.com/video/${content.vimeoId}`}
          className="w-full h-full min-h-[200px]"
          frameBorder="0"
          allowFullScreen
          title={content.title || 'Video'}
        />
      ) : content.videoUrl ? (
        <video
          src={content.videoUrl}
          controls
          className="w-full h-full"
          poster={content.posterUrl}
        >
          Böngészője nem támogatja a videó lejátszást.
        </video>
      ) : (
        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-3xl mb-2">🎥</div>
            <div>Videó modul</div>
          </div>
        </div>
      )}
    </div>
  ),

  services: ({ content }: { content: any }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">🛠️ Szolgáltatások</h3>
      <div className="space-y-3">
        {(content.services || []).map((service: any, index: number) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">{service.name || service.title}</h4>
              <span className="text-blue-600 font-bold">
                {service.price ? `${service.price.toLocaleString()} Ft` : 'Árajánlatra'}
              </span>
            </div>
            {service.description && (
              <p className="text-gray-600 text-sm">{service.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  ),

  testimonials: ({ content }: { content: any }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">⭐ Értékelések</h3>
      <div className="space-y-3">
        {(content.testimonials || []).map((testimonial: any, index: number) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-yellow-400">{'⭐'.repeat(testimonial.rating || 5)}</div>
              <span className="text-sm text-gray-600">{testimonial.author || 'Névtelen'}</span>
            </div>
            <p className="text-gray-700 text-sm italic">"{testimonial.text || testimonial.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  ),

  contact: ({ content }: { content: any }) => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">📞 Kapcsolat</h3>
      <div className="space-y-2">
        {content.phone && (
          <a href={`tel:${content.phone}`} className="flex items-center gap-2 text-blue-600 hover:underline">
            📱 {content.phone}
          </a>
        )}
        {content.email && (
          <a href={`mailto:${content.email}`} className="flex items-center gap-2 text-blue-600 hover:underline">
            📧 {content.email}
          </a>
        )}
        {content.website && (
          <a 
            href={content.website} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            🌐 Weboldal
          </a>
        )}
      </div>
    </div>
  ),

  statistics: ({ content }: { content: any }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">📊 Statisztikák</h3>
      <div className="grid grid-cols-2 gap-4">
        {content.completedProjects && (
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{content.completedProjects}</div>
            <div className="text-sm text-gray-600">Projekt</div>
          </div>
        )}
        {content.yearsExperience && (
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{content.yearsExperience}</div>
            <div className="text-sm text-gray-600">Év tapasztalat</div>
          </div>
        )}
        {content.happyClients && (
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{content.happyClients}</div>
            <div className="text-sm text-gray-600">Elégedett ügyfél</div>
          </div>
        )}
        {content.awards && (
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{content.awards}</div>
            <div className="text-sm text-gray-600">Díj</div>
          </div>
        )}
      </div>
    </div>
  ),

  certificates: ({ content }: { content: any }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">🏆 Tanúsítványok</h3>
      <div className="grid grid-cols-1 gap-3">
        {(content.certificates || []).map((cert: any, index: number) => (
          <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <div className="text-2xl">🏅</div>
            <div>
              <div className="font-medium text-gray-900">{cert.name || cert.title}</div>
              <div className="text-sm text-gray-600">{cert.issuer} • {cert.year}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  default: ({ content, moduleType }: { content: any; moduleType: string }) => (
    <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center text-gray-500">
        <div className="text-2xl mb-2">🧩</div>
        <div className="font-medium">{moduleType}</div>
        <div className="text-sm mt-1">Modul típus még nem implementált</div>
      </div>
    </div>
  )
};

const ProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<ServiceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Annak ellenőrzése, hogy saját profil-e
  const isOwnProfile = isAuthenticated && user && user.id === profile?.id;

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  // ✅ JAVÍTOTT fetchProfile FÜGGVÉNY
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ JAVÍTOTT API ENDPOINT
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log(`🔍 Profil betöltése: ${apiUrl}/api/service-providers/${id}`);
      
      const response = await fetch(`${apiUrl}/api/service-providers/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📄 Profil adatok:', data);
      
      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.error || 'Profil nem található');
      }
    } catch (err: any) {
      console.error('❌ Error fetching profile:', err);
      setError(err.message || 'Hiba történt a profil betöltése során');
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = () => {
    if (isOwnProfile) return; // Saját profilnál ne történjen semmi
    
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
          userId: profile?.id,
          userName: profile?.business_name || `${profile?.first_name} ${profile?.last_name}`,
          profileImage: profile?.profile_image_url
        }
      }
    });
  };

  const handleProjectStart = () => {
    if (isOwnProfile) return; // Saját profilnál ne történjen semmi
    
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
          category: profile?.specializations?.[0],
          profileImage: profile?.profile_image_url
        }
      }
    });
  };

  const handleBookingClick = () => {
    if (isOwnProfile) return; // Saját profilnál ne történjen semmi
    
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

  const getPriceCategoryText = (category?: string) => {
    switch (category) {
      case 'budget':
      case 'low':
        return 'Kedvező árak';
      case 'mid':
      case 'medium':
        return 'Közepes árak';
      case 'premium':
      case 'high':
        return 'Prémium árak';
      default:
        return 'Árak egyeztethetők';
    }
  };

  const getPriceCategoryColor = (category?: string) => {
    switch (category) {
      case 'budget':
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'mid':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'premium':
      case 'high':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Modulok rendezése pozíció és sort_order alapján
  const getSortedModules = () => {
    if (!profile?.modules) return [];
    
    return [...profile.modules]
      .filter(module => module.is_visible !== false)
      .sort((a, b) => {
        // Először Y pozíció szerint (felülről lefelé)
        if (a.position_y !== b.position_y) {
          return a.position_y - b.position_y;
        }
        // Ha ugyanabban a sorban, akkor X pozíció szerint (balról jobbra)
        if (a.position_x !== b.position_x) {
          return a.position_x - b.position_x;
        }
        // Végül sort_order szerint
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
  };

  // Modul renderelő függvény
  const renderModule = (module: any) => {
    const ModuleComponent = ModuleRenderers[module.module_type as keyof typeof ModuleRenderers] || ModuleRenderers.default;
    
    return (
      <div
        key={module.id}
        className="bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md"
        style={{
          gridColumn: `span ${Math.min(module.width || 1, 4)}`,
          gridRow: `span ${Math.min(module.height || 1, 2)}`,
          minHeight: '120px'
        }}
      >
        <ModuleComponent 
          content={module.content} 
          moduleType={module.module_type}
        />
      </div>
    );
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

  const sortedModules = getSortedModules();

  return (
    <div className="min-h-screen bg-gray-50 navbar-padding">
      <Navbar />
      
      {/* Cover Image */}
      {profile.cover_image_url && (
        <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
          <img
            src={profile.cover_image_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Vissza az eredményekhez
        </button>

        <div className={`grid gap-8 ${!isOwnProfile ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {/* Main Content */}
          <div className={`space-y-6 ${!isOwnProfile ? 'lg:col-span-2' : ''}`}>
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8 -mt-16 relative z-10">
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
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold">{profile.business_name}</h1>
                    {/* Ha saját profil, akkor szerkesztési gombok */}
                    {isOwnProfile && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate('/profile/edit')}
                          className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors text-sm"
                        >
                          ✏️ Szerkesztés
                        </button>
                        <button
                          onClick={() => navigate('/profile/modules')}
                          className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors text-sm"
                        >
                          🧩 Modulok
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-blue-100 text-lg mb-2">
                    👤 {profile.first_name} {profile.last_name}
                  </p>
                  <p className="text-blue-100 text-lg mb-3">
                    📍 {profile.location_city}
                    {profile.location_address && `, ${profile.location_address}`}
                  </p>
                  
                  {/* Rating */}
                  {profile.rating_count > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-yellow-400 text-xl">⭐</span>
                      <span className="text-lg font-medium">{profile.rating_average.toFixed(1)}</span>
                      <span className="text-blue-100">({profile.rating_count} értékelés)</span>
                    </div>
                  )}
                  
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

            {/* Moduláris profil tartalom */}
            {sortedModules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">
                {sortedModules.map(renderModule)}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <div className="text-6xl mb-4">🧩</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {isOwnProfile ? 'Profil modulok beállítása' : 'Hamarosan több információ'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {isOwnProfile 
                    ? 'Még nem állított be modulokat a profiljához. Kezdje el a testreszabást!'
                    : 'A szolgáltató hamarosan bővebben bemutatkozik.'}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/profile/modules')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    + Első modul hozzáadása
                  </button>
                )}
              </div>
            )}

            {/* Alapértelmezett információk, ha nincsenek modulok */}
            {sortedModules.length === 0 && (
              <>
                {/* Description */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Bemutatkozás</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {profile.description || 'A szolgáltató még nem írt bemutatkozást.'}
                  </p>
                </div>

                {/* Services */}
                {profile.services && profile.services.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">🛠️ Szolgáltatások</h2>
                    <div className="space-y-4">
                      {profile.services.map((service, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                            <div className="text-right">
                              <span className="text-xl font-bold text-blue-600">
                                {service.base_price?.toLocaleString()} Ft
                              </span>
                              <span className="text-gray-500">/{service.price_unit}</span>
                            </div>
                          </div>
                          {service.description && (
                            <p className="text-gray-700 mb-2">{service.description}</p>
                          )}
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {service.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - csak ha nem saját profil */}
          {!isOwnProfile && (
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
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600">📧</span>
                    <a 
                      href={`mailto:${profile.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {profile.email}
                    </a>
                  </div>
                  {profile.website && (
                    <div className="flex items-center gap-3">
                      <span className="text-blue-600">🌐</span>
                      <a 
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Weboldal
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Árazás</h3>
                <div className="flex items-center gap-4 mb-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getPriceCategoryColor(profile.price_category)}`}>
                    {getPriceCategoryText(profile.price_category)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  Az árak tájékoztató jellegűek. Pontos árajánlatért vedd fel a kapcsolatot!
                </p>
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
                  {profile.rating_count > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-700">{profile.rating_count} pozitív értékelés</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
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

export default ProfileView;