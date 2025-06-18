// frontend/src/components/profile/ProfileView.tsx - Moduláris grid verzió
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';

interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ModuleData {
  id: string;
  type: string;
  position: GridPosition;
  content: any;
  isVisible: boolean;
  sortOrder: number;
}

interface ServiceProfile {
  id: number;
  business_name: string;
  description: string;
  profile_image_url: string;
  user_id: number;
  modules: ModuleData[];
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const GRID_CONFIG = {
  cols: 4,
  rows: 8,
  cellWidth: 200,
  cellHeight: 100,
  gap: 8
};

const ProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<ServiceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profiles/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.error || 'Profil nem található');
      }
    } catch (err: any) {
      setError(err.message || 'Hiba történt a profil betöltése során');
    } finally {
      setLoading(false);
    }
  };

  // Quick Actions handlers
  const handleContactClick = () => {
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
          userId: profile?.user_id,
          userName: profile?.business_name || `${profile?.user.first_name} ${profile?.user.last_name}`,
          profileImage: profile?.profile_image_url
        }
      }
    });
  };

  const handleProjectStart = () => {
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
          userId: profile?.user_id,
          category: profile?.description,
          profileImage: profile?.profile_image_url
        }
      }
    });
  };

  // Render individual module based on type
  const renderModule = (module: ModuleData) => {
    const style = {
      position: 'absolute' as const,
      left: module.position.x * (GRID_CONFIG.cellWidth + GRID_CONFIG.gap),
      top: module.position.y * (GRID_CONFIG.cellHeight + GRID_CONFIG.gap),
      width: module.position.width * GRID_CONFIG.cellWidth + (module.position.width - 1) * GRID_CONFIG.gap,
      height: module.position.height * GRID_CONFIG.cellHeight + (module.position.height - 1) * GRID_CONFIG.gap,
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    };

    if (!module.isVisible) return null;

    switch (module.type) {
      case 'hero':
        return (
          <div key={module.id} style={style}>
            <div className="h-full flex flex-col justify-center items-center text-center">
              {profile?.profile_image_url && (
                <img
                  src={profile.profile_image_url}
                  alt={module.content.title}
                  className="w-16 h-16 rounded-full object-cover mb-3"
                />
              )}
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                {module.content.title || profile?.business_name}
              </h1>
              <p className="text-gray-600 text-sm">
                {module.content.subtitle || profile?.description}
              </p>
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={module.id} style={style}>
            <div className="h-full">
              {module.content.title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {module.content.title}
                </h3>
              )}
              <div className="text-gray-700 text-sm leading-relaxed overflow-y-auto">
                {module.content.content}
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div key={module.id} style={style}>
            <div className="h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📞 Kapcsolat</h3>
              <div className="space-y-2">
                {module.content.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>📱</span>
                    <a href={`tel:${module.content.phone}`} className="text-blue-600 hover:underline">
                      {module.content.phone}
                    </a>
                  </div>
                )}
                {module.content.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>✉️</span>
                    <a href={`mailto:${module.content.email}`} className="text-blue-600 hover:underline">
                      {module.content.email}
                    </a>
                  </div>
                )}
                {module.content.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>📍</span>
                    <span className="text-gray-600">{module.content.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'price_list':
        return (
          <div key={module.id} style={style}>
            <div className="h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                💰 {module.content.title || 'Árlista'}
              </h3>
              <div className="space-y-2 overflow-y-auto">
                {module.content.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{item.service}</span>
                    <span className="font-semibold text-blue-600">
                      {parseInt(item.price).toLocaleString()} Ft
                      {item.unit && <span className="text-xs text-gray-500">/{item.unit}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'stats':
        return (
          <div key={module.id} style={style}>
            <div className="h-full flex items-center justify-around">
              {module.content.items?.map((stat: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-xl font-bold text-blue-600">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div key={module.id} style={style}>
            <div className="h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🖼️ {module.content.title || 'Galéria'}
              </h3>
              {module.content.images?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 h-full overflow-hidden">
                  {module.content.images.slice(0, 4).map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Galéria ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📷</div>
                    <div className="text-sm">Nincsenek képek</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'video':
        return (
          <div key={module.id} style={style}>
            <div className="h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🎥 {module.content.title || 'Videó'}
              </h3>
              {module.content.videoUrl ? (
                <iframe
                  src={module.content.videoUrl}
                  className="w-full h-full rounded"
                  frameBorder="0"
                  allowFullScreen
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎬</div>
                    <div className="text-sm">Nincs videó</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'social':
        return (
          <div key={module.id} style={style}>
            <div className="h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🌐 Közösségi média</h3>
              <div className="flex flex-wrap gap-2">
                {module.content.links?.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
                  >
                    <span>{link.icon}</span>
                    <span>{link.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div key={module.id} style={style}>
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-2xl mb-2">❓</div>
                <div className="text-sm">Ismeretlen modul</div>
              </div>
            </div>
          </div>
        );
    }
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

  return (
    <div className="min-h-screen bg-gray-50 navbar-padding">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Vissza az eredményekhez
        </button>

        {/* Profile Grid Layout */}
        <div className="flex justify-center">
          <div
            style={{
              position: 'relative',
              width: GRID_CONFIG.cols * GRID_CONFIG.cellWidth + (GRID_CONFIG.cols - 1) * GRID_CONFIG.gap,
              height: GRID_CONFIG.rows * GRID_CONFIG.cellHeight + (GRID_CONFIG.rows - 1) * GRID_CONFIG.gap,
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '16px'
            }}
          >
            {/* Render modules if they exist */}
            {profile.modules && profile.modules.length > 0 
              ? profile.modules.map(renderModule)
              : (
                /* Default empty state */
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold mb-2">Profil még nem készült el</h3>
                    <p>A szolgáltató még nem állította be a moduláris profilját.</p>
                    {profile.business_name && (
                      <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
                        <h4 className="font-semibold text-gray-900">{profile.business_name}</h4>
                        {profile.description && (
                          <p className="text-gray-600 mt-2">{profile.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            }
          </div>
        </div>

        {/* Quick Actions - Always visible */}
        <div className="mt-8 flex justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
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
                className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                📋 Projekt indítása
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;