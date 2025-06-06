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
  // Get current user's profile
  getMyProfile: async (): Promise<Profile> => {
    const response = await api.get('/profiles/me');
    return response.data.profile;
  },

  // Create new profile
  createProfile: async (profileData: ProfileData): Promise<Profile> => {
    const response = await api.post('/profiles', profileData);
    return response.data.profile;
  },

  // Update profile
  updateProfile: async (profileData: Partial<ProfileData>): Promise<Profile> => {
    const response = await api.put('/profiles/me', profileData);
    return response.data.profile;
  },

  // Search profiles (public)
  searchProfiles: async (filters?: {
    city?: string;
    priceCategory?: string;
    search?: string;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.priceCategory) params.append('priceCategory', filters.priceCategory);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/profiles/search?${params.toString()}`);
    return response.data;
  },

  // Get profile by ID (public)
  getProfileById: async (id: number): Promise<Profile> => {
    const response = await api.get(`/profiles/${id}`);
    return response.data.profile;
  }
};