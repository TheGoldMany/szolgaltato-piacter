// frontend/src/services/apiServices.ts (opcionális kiegészítő service)
import api from './api'; // A meglévő axios instance
import aiAssistantAPI from './aiAssistantAPI';

// Kiegészítő API szolgáltatások a meglévő api.ts mellé

// User Authentication API (kiegészítő funkcionalitás)
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// Service Providers API
export const providersAPI = {
  getAll: async (filters?: any) => {
    const response = await api.get('/providers', { params: filters });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/providers/${id}`);
    return response.data;
  },
  
  search: async (query: string, filters?: any) => {
    const response = await api.get('/providers/search', { 
      params: { q: query, ...filters }
    });
    return response.data;
  },
  
  getByCategory: async (category: string, filters?: any) => {
    const response = await api.get(`/providers/category/${category}`, {
      params: filters
    });
    return response.data;
  },
  
  getFeatured: async (limit?: number) => {
    const response = await api.get('/providers/featured', {
      params: { limit }
    });
    return response.data;
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  getPopular: async (limit?: number) => {
    const response = await api.get('/categories/popular', {
      params: { limit }
    });
    return response.data;
  }
};

// Export AI assistant is
export { aiAssistantAPI };

// Default export
export default {
  auth: authAPI,
  providers: providersAPI,
  categories: categoriesAPI,
  ai: aiAssistantAPI
};