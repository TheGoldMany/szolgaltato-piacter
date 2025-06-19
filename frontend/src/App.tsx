// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import ProfileEditor from './components/profile/ProfileEditor'; 
import { ProfileView } from './components/profile';
import ServiceProviders from './pages/ServiceProviders';
import ModularProfileEditor from './components/profile/ModularProfileEditor';
import ProjectManager from './pages/ProjectManager';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MessagesPage from './pages/MessagesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AIChatPage from './pages/AIChatPage';
import SettingsPage from './pages/SettingsPage'; // Új import
import RoleProtectedRoute from './components/auth/RoleProtectedRoute'; // Új import
import './App.css';

// Standard Protected Route component (csak bejelentkezést ellenőriz)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Betöltés...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Betöltés...</div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* ==================== PUBLIC ROUTES ==================== */}
            
            {/* Homepage - mindenki számára elérhető */}
            <Route path="/" element={<HomePage />} />
            
            {/* Authentication Routes - csak vendégek számára */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginForm />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterForm />
                </PublicRoute>
              } 
            />

            {/* Public browsing - regisztráció nélkül is elérhető */}
            <Route path="/services" element={<ServiceProviders />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/ai-chat" element={<AIChatPage />} />
            <Route path="/categories" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/profile/:id" element={<ProfileView />} />

            {/* ==================== PROTECTED ROUTES (Általános) ==================== */}
            
            {/* Dashboard - minden bejelentkezett user számára */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Messages - minden bejelentkezett user számára */}
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } 
            />

            {/* ==================== SERVICE PROVIDER ONLY ROUTES ==================== */}
            
            {/* Moduláris profil szerkesztő - CSAK szolgáltatóknak */}
            <Route 
              path="/profile/modular-editor" 
              element={
                <RoleProtectedRoute requiredRole="service_provider">
                  <ModularProfileEditor />
                </RoleProtectedRoute>
              } 
            />

            {/* Teljes profil szerkesztő - CSAK szolgáltatóknak */}
            <Route 
              path="/profile/edit" 
              element={
                <RoleProtectedRoute requiredRole="service_provider">
                  <ProfileEditor />
                </RoleProtectedRoute>
              } 
            />

            {/* Projektek/Workspace - MINDEN bejelentkezett felhasználónak */}
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <ProjectManager />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workspace" 
              element={
                <ProtectedRoute>
                  <ProjectManager />
                </ProtectedRoute>
              } 
            />

            {/* Megrendelések - CSAK szolgáltatóknak */}
            <Route 
              path="/orders" 
              element={
                <RoleProtectedRoute requiredRole="service_provider">
                  <div className="min-h-screen bg-gray-50 navbar-padding">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">📦 Megrendelések</h1>
                        <p className="text-gray-600">A megrendeléskezelő felület hamarosan elérhető lesz.</p>
                      </div>
                    </div>
                  </div>
                </RoleProtectedRoute>
              } 
            />

            {/* Szakképzési tanúsítványok kezelése - CSAK szolgáltatóknak */}
            <Route 
              path="/courses/:id/learn" 
              element={
                <RoleProtectedRoute requiredRole="service_provider">
                  <div className="min-h-screen bg-gray-50 navbar-padding">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">📚 Kurzus Tanulás</h1>
                        <p className="text-gray-600">A tanulási felület hamarosan elérhető lesz.</p>
                      </div>
                    </div>
                  </div>
                </RoleProtectedRoute>
              } 
            />

            {/* Tanúsítványok kezelése - CSAK szolgáltatóknak */}
            <Route 
              path="/my-courses" 
              element={
                <RoleProtectedRoute requiredRole="service_provider">
                  <div className="min-h-screen bg-gray-50 navbar-padding">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">🎓 Tanúsítványaim</h1>
                        <p className="text-gray-600">A tanúsítványkezelő felület hamarosan elérhető lesz.</p>
                      </div>
                    </div>
                  </div>
                </RoleProtectedRoute>
              } 
            />

            {/* ==================== CUSTOMER ONLY ROUTES ==================== */}
            
            {/* Foglalások - CSAK ügyfeleknek */}
            <Route 
              path="/bookings" 
              element={
                <RoleProtectedRoute requiredRole="customer">
                  <div className="min-h-screen bg-gray-50 navbar-padding">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">📅 Foglalásaim</h1>
                        <p className="text-gray-600">A foglaláskezelő felület hamarosan elérhető lesz.</p>
                      </div>
                    </div>
                  </div>
                </RoleProtectedRoute>
              } 
            />

            {/* Kedvencek - CSAK ügyfeleknek */}
            <Route 
              path="/favorites" 
              element={
                <RoleProtectedRoute requiredRole="customer">
                  <div className="min-h-screen bg-gray-50 navbar-padding">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">❤️ Kedvenc szolgáltatók</h1>
                        <p className="text-gray-600">A kedvencek felület hamarosan elérhető lesz.</p>
                      </div>
                    </div>
                  </div>
                </RoleProtectedRoute>
              } 
            />

            {/* ==================== SETTINGS ==================== */}
            
            {/* Beállítások - minden bejelentkezett user számára */}
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />

            {/* ==================== 404 ROUTE ==================== */}
            
            {/* Catch-all route */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Az oldal nem található.</p>
                    <button 
                      onClick={() => window.location.href = '/'}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Vissza a főoldalra
                    </button>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;