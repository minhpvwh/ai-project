import api from './api';
import { Document, DocumentDto, DocumentSearchRequest, DocumentSearchResponse } from '@/types';

export const documentApi = {
  search: async (params: DocumentSearchRequest): Promise<DocumentSearchResponse> => {
    const response = await api.get('/documents/search', { params });
    return response.data;
  },

  getById: async (id: string): Promise<DocumentDto> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  upload: async (formData: FormData): Promise<Document> => {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Document>): Promise<Document> => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  download: async (id: string): Promise<Blob> => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getMyDocuments: async (page: number, size: number): Promise<DocumentSearchResponse> => {
    const response = await api.get('/documents/my', {
      params: { page, size },
    });
    return response.data;
  },
};
