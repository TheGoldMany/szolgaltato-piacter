import api from './api';

interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'service_provider' | 'customer';
  phone?: string;
}

export const authService = {
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    
    if (response.data.token) {
      // CSAK akkor tárolunk localStorage-ban, ha rememberMe = true
      if (data.rememberMe) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('corvus_saved_email', data.email);
        localStorage.setItem('corvus_remember_me', 'true');
      } else {
        // Ha nem akar emlékezni, sessionStorage-ban tároljuk
        sessionStorage.setItem('authToken', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
        // Töröljük a korábbi "remember me" adatokat
        localStorage.removeItem('corvus_saved_email');
        localStorage.removeItem('corvus_remember_me');
      }
    }
    
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    
    if (response.data.token) {
      // Regisztrációnál alapértelmezetten sessionStorage
      sessionStorage.setItem('authToken', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  logout: () => {
    // Mindkét storage-ből töröljük az adatokat
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    
    // FONTOS: "Remember me" adatok megmaradnak a logout után
    // localStorage.removeItem('corvus_saved_email');
    // localStorage.removeItem('corvus_remember_me');
  },

  getCurrentUser: () => {
    // Először localStorage-ból próbáljuk (ha remember me volt)
    let userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    
    // Ha nincs localStorage-ban, sessionStorage-ból
    userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getAuthToken: () => {
    // Először localStorage-ból próbáljuk
    let token = localStorage.getItem('authToken');
    if (token) {
      return token;
    }
    
    // Ha nincs localStorage-ban, sessionStorage-ból
    return sessionStorage.getItem('authToken');
  },

  isAuthenticated: () => {
    return !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
  },

  // Új metódus: ellenőrzi, hogy remember me aktív-e
  isRemembered: () => {
    return localStorage.getItem('corvus_remember_me') === 'true';
  }
};
