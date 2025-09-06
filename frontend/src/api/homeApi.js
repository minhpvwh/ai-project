import api from './api'

export const homeApi = {
  getDashboard: async () => {
    const response = await api.get('/home/dashboard')
    return response.data
  }
}
