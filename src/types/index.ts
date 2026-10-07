export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  rating: number;
  description?: string;
  published_year?: number;
  category_id: number;
  category?: Category;
  is_favorite?: boolean;
  is_read?: boolean;
}

export interface PaginatedBooksResponse {
  items: Book[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

export interface UserBookResponse {
  id: number;
  user_id: number;
  book_id: number;
  is_favorite: boolean;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
  book: Book;
}

export interface UserBookActionResponse {
  book_id: number;
  is_favorite: boolean;
  is_read: boolean;
  message: string;
}
