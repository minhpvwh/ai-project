import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';
import { ApiError } from '@/types';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const authData = JSON.parse(token);
        if (authData.state?.token && config.headers) {
          config.headers.Authorization = `Bearer ${authData.state.token}`;
          console.log('Auth token added to request:', config.url);
        }
      } catch (error) {
        console.error('Error parsing auth token:', error);
      }
    } else {
      console.log('No auth token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
      message.error('Phiên đăng nhập đã hết hạn');
    } else if (error.response?.status >= 500) {
      message.error('Lỗi máy chủ. Vui lòng thử lại sau.');
    } else if (error.response?.data?.error) {
      message.error(error.response.data.error);
    } else {
      message.error('Đã xảy ra lỗi không mong muốn');
    }
    return Promise.reject(error);
  }
);

export default api;
