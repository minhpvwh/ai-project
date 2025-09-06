import api from './api'

export const documentApi = {
  upload: async (formData) => {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  
  search: async (params) => {
    const response = await api.get('/documents/search', { params })
    return response.data
  },
  
  getRecent: async (page = 0, size = 5) => {
    const response = await api.get('/documents/recent', {
      params: { page, size }
    })
    return response.data
  },
  
  getPopular: async (page = 0, size = 5) => {
    const response = await api.get('/documents/popular', {
      params: { page, size }
    })
    return response.data
  },
  
  getMyDocuments: async (page = 0, size = 10) => {
    const response = await api.get('/documents/my-documents', {
      params: { page, size }
    })
    return response.data
  },
  
  getById: async (id) => {
    const response = await api.get(`/documents/${id}`)
    return response.data
  },
  
  update: async (id, data) => {
    const response = await api.put(`/documents/${id}`, data)
    return response.data
  },
  
  delete: async (id) => {
    const response = await api.delete(`/documents/${id}`)
    return response.data
  },
  
  download: async (id) => {
    const response = await api.get(`/documents/${id}/download`)
    return response.data
  }
}
