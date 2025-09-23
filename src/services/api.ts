import axios, { AxiosInstance } from 'axios';
import { Theme, Instrument, Version, SheetMusic, AuthResponse, LoginCredentials } from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                refresh: refreshToken,
              });
              const { access } = response.data;
              localStorage.setItem('access_token', access);
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post('/auth/login/', credentials);
    const { access, refresh, user } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  async getThemes(): Promise<Theme[]> {
    const response = await this.api.get('/themes/');
    return response.data.results || response.data;
  }

  async getTheme(id: number): Promise<Theme> {
    const response = await this.api.get(`/themes/${id}/`);
    return response.data;
  }

  async createTheme(theme: Partial<Theme>): Promise<Theme> {
    const response = await this.api.post('/themes/', theme);
    return response.data;
  }

  async updateTheme(id: number, theme: Partial<Theme>): Promise<Theme> {
    const response = await this.api.put(`/themes/${id}/`, theme);
    return response.data;
  }

  async deleteTheme(id: number): Promise<void> {
    await this.api.delete(`/themes/${id}/`);
  }

  async getInstruments(): Promise<Instrument[]> {
    const response = await this.api.get('/instruments/');
    return response.data.results || response.data;
  }

  async getVersions(): Promise<Version[]> {
    const response = await this.api.get('/versions/');
    return response.data.results || response.data;
  }

  async getSheetMusic(): Promise<SheetMusic[]> {
    const response = await this.api.get('/sheet-music/');
    return response.data.results || response.data;
  }

  async uploadFile(file: File, endpoint: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadMultipleFiles(files: File[], endpoint: string): Promise<any[]> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    const response = await this.api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;