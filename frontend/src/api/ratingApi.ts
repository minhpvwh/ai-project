import api from './api';
import { Rating, RatingRequest } from '@/types';

export const ratingApi = {
  getByDocument: async (documentId: string): Promise<Rating[]> => {
    const response = await api.get(`/ratings/document/${documentId}`);
    return response.data;
  },

  getUserRating: async (documentId: string): Promise<{ hasRating: boolean; score?: number }> => {
    const response = await api.get(`/ratings/user/${documentId}`);
    return response.data;
  },

  addOrUpdateRating: async (documentId: string, score: number): Promise<Rating> => {
    const response = await api.post('/ratings', { documentId, score });
    return response.data;
  },

  delete: async (ratingId: string): Promise<void> => {
    await api.delete(`/ratings/${ratingId}`);
  },
};
