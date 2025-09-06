import { api } from './api';

export interface AIProcessResponse {
  id: string;
  content: string;
  summary: string;
  tags: string[];
  language: string;
  success: boolean;
  message: string;
}

export interface AIProcessRequest {
  content: string;
  title?: string;
}

export interface AIDocument {
  id: string;
  summary: string;
  tags: string[];
  language: string;
  created_at: string;
  content_preview: string;
}

export interface AIDocumentsResponse {
  documents: AIDocument[];
  total: number;
}

export interface AIHealthResponse {
  status: string;
  ai_service: string;
  mongodb: string;
}

class AIApi {
  private baseUrl = 'http://localhost:8001';

  async processText(request: AIProcessRequest): Promise<AIProcessResponse> {
    const response = await fetch(`${this.baseUrl}/api/ai/process-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }

    return response.json();
  }

  async processFile(file: File, title?: string): Promise<AIProcessResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }

    const response = await fetch(`${this.baseUrl}/api/ai/process-file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }

    return response.json();
  }

  async getHealth(): Promise<AIHealthResponse> {
    const response = await fetch(`${this.baseUrl}/api/ai/health`);
    
    if (!response.ok) {
      throw new Error(`AI service health check failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getBackendAIStatus(): Promise<{available: boolean, message: string}> {
    const response = await api.get('/documents/ai/status');
    return response.data;
  }

  async getDocuments(skip = 0, limit = 10): Promise<AIDocumentsResponse> {
    const response = await fetch(`${this.baseUrl}/api/ai/documents?skip=${skip}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get AI documents: ${response.statusText}`);
    }

    return response.json();
  }
}

export const aiApi = new AIApi();
