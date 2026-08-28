import { apiClient } from '../lib/apiClient';
import type { UpdateProfilePayload, User } from '../types/user';

export const userApi = {
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await apiClient.put<User>('/users/me', payload);
    return response.data;
  }
};
