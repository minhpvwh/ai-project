// User types
export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  createdAt: string;
}

// Document types
export interface Document {
  id: string;
  title: string;
  description: string;
  summary?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  tags: string[];
  owner: User;
  visibility: 'PRIVATE' | 'GROUP' | 'PUBLIC';
  viewCount: number;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  author: User;
  document: Document;
  createdAt: string;
  updatedAt: string;
}

// Rating types
export interface Rating {
  id: string;
  score: number;
  user: User;
  document: Document;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface DocumentUploadRequest {
  file: File;
  title: string;
  description: string;
  tags?: string[];
  visibility: 'PRIVATE' | 'GROUP' | 'PUBLIC';
}

export interface DocumentSearchRequest {
  query?: string;
  tags?: string[];
  visibility?: 'PRIVATE' | 'GROUP' | 'PUBLIC';
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface DocumentSearchResponse {
  content: Document[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CommentRequest {
  content: string;
  documentId: string;
}

export interface RatingRequest {
  score: number;
  documentId: string;
}

// Home page data types
export interface HomeData {
  newestDocuments: Document[];
  popularDocuments: Document[];
  userDocuments: Document[];
}

// Form types
export interface DocumentFormData {
  title: string;
  description: string;
  tags: string[];
  visibility: 'PRIVATE' | 'GROUP' | 'PUBLIC';
  file?: File;
}

// API Error types
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path: string;
}
