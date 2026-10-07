import type {
  AuthResponse,
  Category,
  PaginatedBooksResponse,
  Book,
  User,
  UserBookResponse,
  UserBookActionResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // If unauthorized, clear token
      this.setToken(null);
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
      } catch {
        errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // --- Auth Endpoints ---
  async register(data: { email: string; password: string; full_name?: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login/json', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories/');
  }

  // --- Books ---
  async getBooks(page = 1, limit = 20, search?: string): Promise<PaginatedBooksResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search && search.trim()) {
      params.set('search', search.trim());
    }
    return this.request<PaginatedBooksResponse>(`/books/?${params.toString()}`);
  }

  async getBooksByCategory(categoryId: number, page = 1, limit = 20): Promise<PaginatedBooksResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return this.request<PaginatedBooksResponse>(`/books/category/${categoryId}?${params.toString()}`);
  }

  async getBook(bookId: number): Promise<Book> {
    return this.request<Book>(`/books/${bookId}`);
  }

  // --- User Books (Favorites & Read) ---
  async addFavorite(bookId: number): Promise<UserBookActionResponse> {
    return this.request<UserBookActionResponse>(`/user/favorites/${bookId}`, {
      method: 'POST',
    });
  }

  async removeFavorite(bookId: number): Promise<UserBookActionResponse> {
    return this.request<UserBookActionResponse>(`/user/favorites/${bookId}`, {
      method: 'DELETE',
    });
  }

  async getFavorites(skip = 0, limit = 100): Promise<UserBookResponse[]> {
    return this.request<UserBookResponse[]>(`/user/favorites?skip=${skip}&limit=${limit}`);
  }

  async markAsRead(bookId: number): Promise<UserBookActionResponse> {
    return this.request<UserBookActionResponse>(`/user/read/${bookId}`, {
      method: 'POST',
    });
  }

  async unmarkAsRead(bookId: number): Promise<UserBookActionResponse> {
    return this.request<UserBookActionResponse>(`/user/read/${bookId}`, {
      method: 'DELETE',
    });
  }

  async getReadBooks(skip = 0, limit = 100): Promise<UserBookResponse[]> {
    return this.request<UserBookResponse[]>(`/user/read?skip=${skip}&limit=${limit}`);
  }
}

export const api = new ApiService();
