import api from './api';
import { HomeData } from '@/types';

export const homeApi = {
  getDashboard: async (): Promise<HomeData> => {
    const response = await api.get('/home/dashboard');
    return response.data;
  },
};
