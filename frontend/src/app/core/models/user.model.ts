// src/app/core/models/user.model.ts

export enum UserRole {
  ADMIN = 0,
  UKNF_WORKER = 1,
  COMPANY_USER = 2 
}

export interface LoginRequest {
  username: string;
  password: string;
}

// TO JEST KLUCZOWE - bez tego TypeScript sypie błędami w auth.ts
export interface AuthResponse {
  token: string;     // <--- Musi tu być, żebyś mógł zrobić response.token
  username?: string; // Opcjonalne, jeśli backend zwraca
  role?: UserRole;   // Opcjonalne
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  rola: UserRole;
  podmiotId?: number | null;
}

export interface User {
  id: string; 
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}