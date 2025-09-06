import api from './api'

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },
  
  validateToken: async () => {
    const response = await api.post('/auth/validate')
    return response.data
  }
}
