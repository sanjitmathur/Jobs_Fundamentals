export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface AuthData {
  token: string;
}

export interface AuthResponse {
  success: boolean;
  data: AuthData;
}

export interface RegisterResponse {
  success: boolean;
  data: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface JwtTokenPayload {
  userId: string;
  role: Role;
  exp?: number;
  iat?: number;
}
