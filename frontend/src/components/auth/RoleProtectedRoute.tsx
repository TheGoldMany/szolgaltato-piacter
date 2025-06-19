// frontend/src/components/auth/RoleProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'service_provider' | 'customer'; // VISSZA: client -> customer
  fallbackRoute?: string;
}

/**
 * Role-based védett route komponens
 * 
 * @param children - A megjelenítendő komponens
 * @param requiredRole - Szükséges felhasználói szerepkör
 * @param fallbackRoute - Átirányítási útvonal, ha nincs megfelelő jogosultság
 */
const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  fallbackRoute = '/dashboard'
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Betöltés...</div>
        </div>
      </div>
    );
  }

  // Ha nincs bejelentkezve, irányítsa a login oldalra
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Ha nincs user adat, irányítsa a dashboard-ra
  if (!user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Ha van szerepkör követelmény, de a user nem felel meg
  if (requiredRole && user.userType !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-50 navbar-padding">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-xl p-8 text-center shadow-lg border border-red-200">
            <div className="text-6xl mb-6">🚫</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Hozzáférés megtagadva
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              {requiredRole === 'service_provider' 
                ? 'Ez a funkció csak szolgáltatók számára érhető el.'
                : 'Ez a funkció csak ügyfelek számára érhető el.'
              }
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Jelenlegi szerepkörön: {user.userType === 'service_provider' ? 'Szolgáltató' : 'Ügyfél'}
            </p>
            
            <div className="space-y-4">
              {/* Ha ügyfél próbál szolgáltatói funkcióhoz férni */}
              {requiredRole === 'service_provider' && user.userType === 'customer' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">
                    💡 Szeretnél szolgáltatóvá válni?
                  </h3>
                  <p className="text-blue-700 text-sm mb-4">
                    Kapcsolódj a Corvus szolgáltatói közösségéhez és kínáld szolgáltatásaidat!
                  </p>
                  <button 
                    onClick={() => window.location.href = '/become-provider'}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Szolgáltatóvá válás
                  </button>
                </div>
              )}

              {/* Navigációs gombok */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  📊 Dashboard-ra
                </button>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🏠 Főoldalra
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ha minden rendben, jelenítse meg a gyerek komponenst
  return <>{children}</>;
};

export default RoleProtectedRoute;