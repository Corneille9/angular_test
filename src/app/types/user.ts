export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  orders_count?: number;
  has_verified_email: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Auth Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfileRequest {
  name?: string;
}

// Admin User Management Request Types
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string | null;
  password_confirmation?: string | null;
  role?: UserRole;
}

