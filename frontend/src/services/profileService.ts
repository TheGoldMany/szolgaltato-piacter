// frontend/src/services/profileService.ts - JAVÍTOTT ÚTVONALAK
import api from './api';

export interface ProfileData {
  businessName: string;
  description: string;
  locationCity: string;
  locationAddress?: string;
  priceCategory: 'budget' | 'mid' | 'premium';
  website?: string;
}

export interface Profile extends ProfileData {
  id: number;
  userId: number;
  profileImageUrl?: string;
  coverImageUrl?: string;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export const profileService = {
  // Get current user's profile (JAVÍTOTT)
  getMyProfile: async (): Promise<Profile> => {
    const response = await api.get('/users/profiles/me');  // ✅ JAVÍTOTT
    return response.data.data;  // response structure javítva
  },

  // Create new profile (JAVÍTOTT)
  createProfile: async (profileData: ProfileData): Promise<Profile> => {
    const response = await api.post('/users/profiles', profileData);  // ✅ JAVÍTOTT
    return response.data.data;
  },

  // Update profile (JAVÍTOTT)
  updateProfile: async (profileData: Partial<ProfileData>): Promise<Profile> => {
    const response = await api.put('/users/profiles/me', profileData);  // ✅ JAVÍTOTT
    return response.data.data;
  },

  // Search profiles (public) - ÚJ ENDPOINT KELL!
  searchProfiles: async (filters?: {
    city?: string;
    priceCategory?: string;
    search?: string;
    limit?: number;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.priceCategory) params.append('price_category', filters.priceCategory);
    if (filters?.search) params.append('query', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    // ✅ JAVÍTOTT - users/profiles/search endpoint
    const response = await api.get(`/users/profiles/search?${params.toString()}`);
    return response.data;
  },

  // Get profile by ID (public) - ÚJ ENDPOINT KELL!
  getProfileById: async (id: number): Promise<Profile> => {
    // ✅ JAVÍTOTT - users/profiles/public/ endpoint
    const response = await api.get(`/users/profiles/public/${id}`);
    return response.data.data;
  },

  // ÚJ! Modulok mentése
  saveModules: async (modules: any[]) => {
    const response = await api.post('/users/profiles/modules', { modules });
    return response.data;
  }
};