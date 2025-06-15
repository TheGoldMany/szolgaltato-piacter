import api from './api';

export interface ProfileModule {
  uuid: string;
  profile_id: number;
  module_type: string;
  content: any;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ModuleCreateData {
  module_type: string;
  content: any;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  sort_order?: number;
}

export interface ModuleUpdateData {
  content?: any;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  sort_order?: number;
  is_visible?: boolean;
}

class ModuleService {
  async getProfileModules(profileId: number): Promise<ProfileModule[]> {
    try {
      const response = await api.get(`/profiles/${profileId}/modules`);
      return response.data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  }

  async createModule(profileId: number, moduleData: ModuleCreateData): Promise<ProfileModule> {
    try {
      const response = await api.post(`/profiles/${profileId}/modules`, moduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating module:', error);
      throw error;
    }
  }

  async updateModule(profileId: number, moduleId: string, moduleData: ModuleUpdateData): Promise<ProfileModule> {
    try {
      const response = await api.put(`/profiles/${profileId}/modules/${moduleId}`, moduleData);
      return response.data;
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  }

  async deleteModule(profileId: number, moduleId: string): Promise<void> {
    try {
      await api.delete(`/profiles/${profileId}/modules/${moduleId}`);
    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  }

  async updateModuleBatch(profileId: number, modules: ProfileModule[]): Promise<ProfileModule[]> {
    try {
      const response = await api.put(`/profiles/${profileId}/modules/batch`, { modules });
      return response.data;
    } catch (error) {
      console.error('Error batch updating modules:', error);
      throw error;
    }
  }
}

export default new ModuleService();