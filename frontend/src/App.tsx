import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import Navbar from './components/common/Navbar';
import ProfileEditor from './components/profile/ProfileEditor';
import './App.css';

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

const AppContent: React.FC = () => {
  return (
    <div className="App">
      <Routes>
  {/* Public Routes */}
  <Route path="/" element={<HomePage />} />
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
        <Navbar />
        <Dashboard />
      </ProtectedRoute>
    } 
  />
  
  {/* ÚJ ROUTE */}
  <Route 
    path="/profile/edit" 
    element={
      <ProtectedRoute>
        <Navbar />
        <ProfileEditor />
      </ProtectedRoute>
    } 
  />

  {/* Catch all route */}
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;