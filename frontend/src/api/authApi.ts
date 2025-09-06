import api from './api';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  validateToken: async (): Promise<{ valid: boolean; user?: User }> => {
    const response = await api.post('/auth/validate');
    return response.data;
  }
};
