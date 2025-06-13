import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Container from '../components/layout/Container';
import Card from '../components/common/Card';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <Container className="py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Üdvözöllek, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600">
            {user?.userType === 'service_provider' 
              ? 'Kezeld szolgáltatásaidat és projektjeidet egyszerűen'
              : 'Találd meg a tökéletes szolgáltatót minden igényedre'
            }
          </p>
        </div>

        {/* Quick Stats or Welcome Info */}
        {user?.userType === 'service_provider' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center" padding="lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">156</div>
              <p className="text-sm text-gray-600">Profil megtekintés</p>
            </Card>
            <Card className="text-center" padding="lg">
              <div className="text-2xl font-bold text-green-600 mb-1">23</div>
              <p className="text-sm text-gray-600">Új üzenet</p>
            </Card>
            <Card className="text-center" padding="lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">89%</div>
              <p className="text-sm text-gray-600">Profil teljesség</p>
            </Card>
            <Card className="text-center" padding="lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">4.8</div>
              <p className="text-sm text-gray-600">Átlag értékelés</p>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {user?.userType === 'service_provider' ? (
            <>
              {/* Service Provider Cards */}
              <Card hover={true}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">👤</div>
                    <h3 className="text-xl font-semibold">Profil kezelése</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Szerkeszd profilodat és szolgáltatásaidat
                  </p>
                  <div className="space-y-2">
                    <Link 
                      to="/profile/edit" 
                      className="btn btn-secondary w-full"
                      style={{textDecoration: 'none'}}
                    >
                      📝 Alap profil szerkesztése
                    </Link>
                    <Link 
                      to="/profile/modular-editor" 
                      className="btn btn-primary w-full"
                      style={{textDecoration: 'none'}}
                    >
                      🎨 Moduláris szerkesztő
                    </Link>
                  </div>
                </div>
              </Card>

              <Card hover={true}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">📸</div>
                    <h3 className="text-xl font-semibold">Galéria</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Töltsd fel munkáid képeit és videóit
                  </p>
                  <button className="btn btn-outline w-full">
                    Képek feltöltése (hamarosan)
                  </button>
                </div>
              </Card>

              <Card hover={true}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">💬</div>
                    <h3 className="text-xl font-semibold">Üzenetek</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    3 új üzenet várja válaszod
                  </p>
                  <button className="btn btn-secondary w-full">
                    Üzenetek megtekintése (hamarosan)
                  </button>
                </div>
              </Card>

              <Card hover={true}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">📋</div>
                    <h3 className="text-xl font-semibold">Szolgáltatások</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Kezeld szolgáltatásaidat és árajdat
                  </p>
                  <button className="btn btn-outline w-full">
                    Szolgáltatások kezelése (hamarosan)
                  </button>
                </div>
              </Card>

              <Card hover={true}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">💰</div>
                    <h3 className="text-xl font-semibold">Pénzügyek</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Bevételek és kifizetések követése
                  </p>
                  <button className="btn btn-outline w-full">
                    Pénzügyek megtekintése (hamarosan)
                  </button>
                </div>
              </Card>

              <Card hover={true}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">🎓</div>
                    <h3 className="text-xl font-semibold">Corvus Képzések</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Szakmai fejlődés és tanúsítványok
                  </p>
                  <button className="btn btn-outline w-full">
                    Képzések böngészése (hamarosan)
                  </button>
                </div>
              </Card>
            </>
          ) : (
            <>
              {/* Customer Cards */}
              <Card hover={true}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">🔍</div>
                    <h3 className="text-xl font-semibold">Keresés</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Találd meg a tökéletes szolgáltatót
                  </p>
                  <Link 
                    to="/services" 
                    className="btn btn-primary w-full"
                    style={{textDecoration: 'none'}}
                  >
                    Szolgáltatók böngészése
                  </Link>
                </div>
              </Card>

              <Card hover={true}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">⭐</div>
                    <h3 className="text-xl font-semibold">Kedvencek</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Még nincsenek kedvenc szolgáltatóid
                  </p>
                  <button className="btn btn-outline w-full">
                    Kedvencek kezelése (hamarosan)
                  </button>
                </div>
              </Card>

              <Card hover={true}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">📋</div>
                    <h3 className="text-xl font-semibold">Projektjeim</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Nincs aktív projektef
                  </p>
                  <button className="btn btn-secondary w-full">
                    Projekt indítása (hamarosan)
                  </button>
                </div>
              </Card>

              <Card hover={true}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">💬</div>
                    <h3 className="text-xl font-semibold">Üzenetek</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Nincs új üzeneted
                  </p>
                  <button className="btn btn-outline w-full">
                    Beszélgetések (hamarosan)
                  </button>
                </div>
              </Card>

              <Card hover={true}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">🎓</div>
                    <h3 className="text-xl font-semibold">Corvus Képzések</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Tanulj új készségeket
                  </p>
                  <button className="btn btn-outline w-full">
                    Képzések böngészése (hamarosan)
                  </button>
                </div>
              </Card>

              <Card hover={true}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">⚖️</div>
                    <h3 className="text-xl font-semibold">AI Tanácsadó</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Kérdezd meg az AI-t a problémádról
                  </p>
                  <button className="btn btn-outline w-full">
                    AI Chat indítása (hamarosan)
                  </button>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions for Service Providers */}
        {user?.userType === 'service_provider' && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">🚀 Gyors műveletek</h2>
            <div className="flex gap-4 flex-wrap">
              <Link 
                to="/profile/edit" 
                className="btn btn-outline" 
                style={{textDecoration: 'none'}}
              >
                📝 Alap profil
              </Link>
              <Link 
                to="/profile/modular-editor" 
                className="btn btn-primary" 
                style={{textDecoration: 'none'}}
              >
                🎨 Moduláris szerkesztő
              </Link>
              <button className="btn btn-outline">
                📸 Képek feltöltése
              </button>
              <button className="btn btn-outline">
                💼 Új szolgáltatás hozzáadása
              </button>
              <button className="btn btn-secondary">
                📊 Statisztikák megtekintése
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions for Customers */}
        {user?.userType === 'customer' && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">🔥 Ajánlott neked</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="text-center" hover={true}>
                <div className="p-6">
                  <div className="text-3xl mb-3">🏗️</div>
                  <h3 className="font-semibold mb-2">Építés & Felújítás</h3>
                  <p className="text-sm text-gray-600 mb-4">234 szakember</p>
                  <Link 
                    to="/services?category=epites-felujitas" 
                    className="btn btn-outline btn-sm"
                    style={{textDecoration: 'none'}}
                  >
                    Böngészés
                  </Link>
                </div>
              </Card>
              
              <Card className="text-center" hover={true}>
                <div className="p-6">
                  <div className="text-3xl mb-3">💻</div>
                  <h3 className="font-semibold mb-2">IT & Fejlesztés</h3>
                  <p className="text-sm text-gray-600 mb-4">189 szakember</p>
                  <Link 
                    to="/services?category=it-technologia" 
                    className="btn btn-outline btn-sm"
                    style={{textDecoration: 'none'}}
                  >
                    Böngészés
                  </Link>
                </div>
              </Card>
              
              <Card className="text-center" hover={true}>
                <div className="p-6">
                  <div className="text-3xl mb-3">🎨</div>
                  <h3 className="font-semibold mb-2">Kreatív & Design</h3>
                  <p className="text-sm text-gray-600 mb-4">156 szakember</p>
                  <Link 
                    to="/services?category=grafikai-tervezes" 
                    className="btn btn-outline btn-sm"
                    style={{textDecoration: 'none'}}
                  >
                    Böngészés
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        )}
      </Container>
    </Layout>
  );
};

export default Dashboard;