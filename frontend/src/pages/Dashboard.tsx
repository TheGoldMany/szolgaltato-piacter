import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen" style={{paddingTop: '80px'}}>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Üdvözöllek, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600">
            {user?.userType === 'service_provider' 
              ? 'Szolgáltatói Dashboard' 
              : 'Ügyfél Dashboard'
            }
          </p>
        </div>

        <div className="grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {user?.userType === 'service_provider' ? (
            <>
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">📊 Statisztikák</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Profil megtekintések:</span>
                    <span className="font-semibold">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kapcsolatfelvételek:</span>
                    <span className="font-semibold">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Értékelések:</span>
                    <span className="font-semibold">4.8 ⭐</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-4">🎨 Profil kezelés</h3>
                <div className="space-y-4">
                  <Link to="/profile/edit" className="btn btn-primary w-full" style={{textDecoration: 'none', display: 'block', textAlign: 'center'}}>
                    Profil szerkesztése
                  </Link>
                  <Link to="/profile/view" className="btn btn-outline w-full" style={{textDecoration: 'none', display: 'block', textAlign: 'center'}}>
                    Profil előnézet
                  </Link>
                  <button className="btn btn-outline w-full">
                    Képek feltöltése (hamarosan)
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-4">💬 Üzenetek</h3>
                <p className="text-gray-600 mb-4">3 új üzenet várja válaszod</p>
                <button className="btn btn-secondary w-full">
                  Üzenetek megtekintése (hamarosan)
                </button>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-4">📋 Szolgáltatások</h3>
                <p className="text-gray-600 mb-4">Kezeld szolgáltatásaidat és árajdat</p>
                <button className="btn btn-outline w-full">
                  Szolgáltatások kezelése (hamarosan)
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">🔍 Keresés</h3>
                <p className="text-gray-600 mb-4">Találd meg a tökéletes szolgáltatót</p>
                <button className="btn btn-primary w-full">
                  Szolgáltatók böngészése (hamarosan)
                </button>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-4">⭐ Kedvencek</h3>
                <p className="text-gray-600 mb-4">Még nincsenek kedvenc szolgáltatóid</p>
                <button className="btn btn-outline w-full">
                  Kedvencek kezelése (hamarosan)
                </button>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-4">📋 Rendelések</h3>
                <p className="text-gray-600 mb-4">Nincs aktív rendelésed</p>
                <button className="btn btn-secondary w-full">
                  Rendelés előzmények (hamarosan)
                </button>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions for Service Providers */}
        {user?.userType === 'service_provider' && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">🚀 Gyors műveletek</h2>
            <div className="flex gap-4 flex-wrap">
              <Link to="/profile/edit" className="btn btn-primary" style={{textDecoration: 'none'}}>
                ✏️ Profil szerkesztése
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
      </div>
    </div>
  );
};

export default Dashboard;