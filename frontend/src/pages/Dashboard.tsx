import React from 'react';
import { useAuth } from '../context/AuthContext';

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
                  <button className="btn btn-primary w-full">
                    Profil szerkesztése
                  </button>
                  <button className="btn btn-outline w-full">
                    Képek feltöltése
                  </button>
                  <button className="btn btn-outline w-full">
                    Szolgáltatások kezelése
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-4">💬 Üzenetek</h3>
                <p className="text-gray-600 mb-4">3 új üzenet várja válaszod</p>
                <button className="btn btn-secondary w-full">
                  Üzenetek megtekintése
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">🔍 Keresés</h3>
                <p className="text-gray-600 mb-4">Találd meg a tökéletes szolgáltatót</p>
                <button className="btn btn-primary w-full">
                  Szolgáltatók böngészése
                </button>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-4">⭐ Kedvencek</h3>
                <p className="text-gray-600 mb-4">Még nincsenek kedvenc szolgáltatóid</p>
                <button className="btn btn-outline w-full">
                  Kedvencek kezelése
                </button>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-4">📋 Rendelések</h3>
                <p className="text-gray-600 mb-4">Nincs aktív rendelésed</p>
                <button className="btn btn-secondary w-full">
                  Rendelés előzmények
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;