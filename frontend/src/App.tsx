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
            
            {/* Profile Management Routes */}
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

            {/* Project Management Routes */}
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <ProjectManager />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/my" 
              element={
                <ProtectedRoute>
                  <ProjectManager />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/create" 
              element={
                <ProtectedRoute>
                  <ProjectManager />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/:id" 
              element={
                <ProtectedRoute>
                  <ProjectManager />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/:id/workspace" 
              element={
                <ProtectedRoute>
                  <ProjectManager />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/:id/settings" 
              element={
                <ProtectedRoute>
                  <ProjectManager />
                </ProtectedRoute>
              } 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;