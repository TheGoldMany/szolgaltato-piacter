// frontend/src/services/serviceProviderService.ts - ÚJ PUBLIKUS API
import api from './api';

export interface ServiceProvider {
  id: number;
  business_name: string;
  description: string;
  location_city: string;
  price_category?: string;
  rating_average: number;
  rating_count: number;
  profile_image_url?: string;
  cover_image_url?: string;
  first_name: string;
  last_name: string;
  services?: Array<{
    id: number;
    title: string;
    base_price: number;
    price_unit: string;
    category: string;
  }>;
  modules?: Array<{
    module_type: string;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    content: any;
  }>;
}

export interface SearchFilters {
  query?: string;
  city?: string;
  price_category?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export const serviceProviderService = {
  // Publikus keresés - JAVÍTOTT ENDPOINT
  searchProviders: async (filters?: SearchFilters) => {
    const params = new URLSearchParams();
    
    if (filters?.query) params.append('query', filters.query);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.price_category) params.append('price_category', filters.price_category);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    // ✅ ÚJ ENDPOINT
    const response = await api.get(`/service-providers?${params.toString()}`);
    return response.data;
  },

  // Profil megtekintés - JAVÍTOTT ENDPOINT
  getProviderById: async (id: number): Promise<ServiceProvider> => {
    // ✅ ÚJ ENDPOINT
    const response = await api.get(`/service-providers/${id}`);
    return response.data.data;
  },

  // Kategóriák lekérése
  getCategories: async () => {
    const response = await api.get('/service-providers/meta/categories');
    return response.data.data;
  }
};