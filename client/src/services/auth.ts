import api from './api';
import type { AuthResponse, User, Profile } from '../types/auth';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.profile) {
        localStorage.setItem('profile', JSON.stringify(response.data.profile));
      }
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
  },

  getMe: async (): Promise<{ user: User; profile?: Profile }> => {
    const response = await api.get<{ user: User; profile?: Profile }>('/auth/me');
    if (response.data.profile) {
      localStorage.setItem('profile', JSON.stringify(response.data.profile));
    }
    return response.data;
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getProfile: (): Profile | null => {
    const profileStr = localStorage.getItem('profile');
    return profileStr ? JSON.parse(profileStr) : null;
  },
};

export type { User, Profile };
