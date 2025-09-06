import api from './api';

export interface UserManagementDto {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  enabled: boolean;
  accountNonLocked: boolean;
  createdAt: string;
  lastLoginAt?: string;
  documentCount: number;
}

export interface UserSearchResponse {
  content: UserManagementDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  fullName?: string;
  password: string;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  enabled?: boolean;
  accountNonLocked?: boolean;
}

export interface UpdatePasswordRequest {
  password: string;
}

export interface BlockUserRequest {
  block: boolean;
}

export const userManagementApi = {
  // Get all users with pagination and search
  getUsers: async (page: number = 0, size: number = 10, search?: string): Promise<UserSearchResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<UserManagementDto> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData: CreateUserRequest): Promise<UserManagementDto> => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, userData: UpdateUserRequest): Promise<UserManagementDto> => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  // Update user password
  updatePassword: async (id: string, passwordData: UpdatePasswordRequest): Promise<{ message: string }> => {
    const response = await api.put(`/admin/users/${id}/password`, passwordData);
    return response.data;
  },

  // Block/Unblock user
  toggleUserBlock: async (id: string, blockData: BlockUserRequest): Promise<{ message: string; user: UserManagementDto }> => {
    const response = await api.put(`/admin/users/${id}/block`, blockData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};
