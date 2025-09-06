import api from './api'

export const commentApi = {
  add: async (documentId, content) => {
    const response = await api.post(`/comments/${documentId}`, { content })
    return response.data
  },
  
  getByDocument: async (documentId, page = 0, size = 10) => {
    const response = await api.get(`/comments/${documentId}`, {
      params: { page, size }
    })
    return response.data
  },
  
  update: async (commentId, content) => {
    const response = await api.put(`/comments/${commentId}`, { content })
    return response.data
  },
  
  delete: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`)
    return response.data
  }
}
