// frontend/src/components/debug/AuthDebug.tsx
// Ideiglenes debug komponens az auth problémák diagnosztizálására

import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const getTokenInfo = () => {
    const localStorage_token = localStorage.getItem('authToken');
    const sessionStorage_token = sessionStorage.getItem('authToken');
    const localStorage_user = localStorage.getItem('user');
    const sessionStorage_user = sessionStorage.getItem('user');
    
    return {
      localStorage_token: localStorage_token ? localStorage_token.substring(0, 20) + '...' : 'null',
      sessionStorage_token: sessionStorage_token ? sessionStorage_token.substring(0, 20) + '...' : 'null',
      localStorage_user: localStorage_user ? 'van' : 'nincs',
      sessionStorage_user: sessionStorage_user ? 'van' : 'nincs',
      context_user: user ? `${user.email} (${user.userType})` : 'null',
      context_authenticated: isAuthenticated
    };
  };

  const tokenInfo = getTokenInfo();

  const testApiCall = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        alert('❌ Nincs token!');
        return;
      }

      const response = await fetch('http://localhost:5000/api/users/profiles/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ API hívás sikeres: ${data.data?.business_name || 'Nincs profil'}`);
      } else {
        alert(`❌ API hívás sikertelen: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Hiba: ${error}`);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Csak development módban jelenjen meg
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#f0f0f0',
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '400px'
    }}>
      <h4>🛠️ Auth Debug</h4>
      <div>
        <strong>localStorage token:</strong> {tokenInfo.localStorage_token}<br/>
        <strong>sessionStorage token:</strong> {tokenInfo.sessionStorage_token}<br/>
        <strong>localStorage user:</strong> {tokenInfo.localStorage_user}<br/>
        <strong>sessionStorage user:</strong> {tokenInfo.sessionStorage_user}<br/>
        <strong>Context user:</strong> {tokenInfo.context_user}<br/>
        <strong>Context authenticated:</strong> {tokenInfo.context_authenticated ? 'igen' : 'nem'}<br/>
      </div>
      <button 
        onClick={testApiCall}
        style={{
          marginTop: '10px',
          padding: '5px 10px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        🧪 Test API Call
      </button>
    </div>
  );
};

export default AuthDebug;