import { apiClient } from './client';
import { AuthResponse, LoginCredentials, RegisterCredentials, RegisterResponse } from '../../types/auth';

export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    skipAuth: true,
  });
}

export async function registerApi(credentials: RegisterCredentials): Promise<RegisterResponse> {
  return apiClient<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
    skipAuth: true,
  });
}
