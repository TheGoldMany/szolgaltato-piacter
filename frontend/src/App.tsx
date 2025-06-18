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
import MessagesPage from './pages/MessagesPage'; // Új import
import './App.css';
import HowItWorksPage from './pages/HowItWorksPage';
import AIChatPage from './pages/AIChatPage';

// Protected Route component
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServiceProviders />} />
            <Route path="/browse" element={<ServiceProviders />} />
            <Route path="/profile/:id" element={<ProfileView />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            
            {/* Courses Routes */}
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/categories" element={<CoursesPage />} />
            
            {/* AI Chat Routes */}
            <Route path="/ai-chat" element={<AIChatPage />} />
            <Route 
              path="/ai-chat/history" 
              element={
                <ProtectedRoute>
                  <AIChatPage showHistory={true} />
                </ProtectedRoute>
              } 
            />
            
            {/* Auth Routes */}
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

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Profile Routes */}
            <Route 
              path="/profile/edit" 
              element={
                <ProtectedRoute>
                  <ProfileEditor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/modular-editor" 
              element={
                <ProtectedRoute>
                  <ModularProfileEditor />
                </ProtectedRoute>
              } 
            />

            {/* Messages Route */}
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } 
            />

            {/* Projects Route */}
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

            {/* Course Learning Routes - Protected */}
            <Route 
              path="/courses/:id/learn" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50 navbar-padding">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">📚 Kurzus Tanulás</h1>
                        <p className="text-gray-600">A tanulási felület hamarosan elérhető lesz.</p>
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* User Course Management - Protected */}
            <Route 
              path="/my-courses" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50 navbar-padding">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">📖 Kurzusaim</h1>
                        <p className="text-gray-600">A kurzusok kezelése hamarosan elérhető lesz.</p>
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/my-certificates" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50 navbar-padding">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">🏆 Tanúsítványaim</h1>
                        <p className="text-gray-600">A tanúsítványok megtekintése hamarosan elérhető lesz.</p>
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Additional Protected Routes */}
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50 navbar-padding">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">📦 Megrendelések</h1>
                        <p className="text-gray-600">A megrendelések kezelése hamarosan elérhető lesz.</p>
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/bookings" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50 navbar-padding">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">📅 Foglalásaim</h1>
                        <p className="text-gray-600">A foglalások kezelése hamarosan elérhető lesz.</p>
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/favorites" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50 navbar-padding">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">❤️ Kedvencek</h1>
                        <p className="text-gray-600">A kedvencek kezelése hamarosan elérhető lesz.</p>
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50 navbar-padding">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">⚙️ Beállítások</h1>
                        <p className="text-gray-600">A beállítások hamarosan elérhetőek lesznek.</p>
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;