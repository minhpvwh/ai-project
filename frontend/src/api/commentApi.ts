import api from './api';
import { Comment, CommentRequest, DocumentSearchResponse } from '@/types';

export const commentApi = {
  getByDocument: async (documentId: string): Promise<{ content: Comment[] }> => {
    const response = await api.get(`/comments/document/${documentId}`);
    return response.data;
  },

  add: async (documentId: string, content: string): Promise<Comment> => {
    const response = await api.post('/comments', { documentId, content });
    return response.data;
  },

  update: async (commentId: string, content: string): Promise<Comment> => {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data;
  },

  delete: async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },
};
