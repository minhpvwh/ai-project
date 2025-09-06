import api from './api'

export const ratingApi = {
  addOrUpdate: async (documentId, score) => {
    const response = await api.post(`/ratings/${documentId}`, { score })
    return response.data
  },
  
  getUserRating: async (documentId) => {
    const response = await api.get(`/ratings/${documentId}/user`)
    return response.data
  },
  
  getDocumentRatings: async (documentId) => {
    const response = await api.get(`/ratings/${documentId}/all`)
    return response.data
  },
  
  delete: async (ratingId) => {
    const response = await api.delete(`/ratings/${ratingId}`)
    return response.data
  }
}
