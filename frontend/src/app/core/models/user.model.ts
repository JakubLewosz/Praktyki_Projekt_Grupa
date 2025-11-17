// Zakładam, że tak wygląda Twój plik, po prostu dodaj 'nip' i 'regon'
// lub zastąp całą zawartość, jeśli nie jesteś pewien.

export enum UserRole {
  ADMIN = 0,
  UKNF_WORKER = 1,
  COMPANY_USER = 2 
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiration: string;
  username?: string;
  role?: string;
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
  role: string;
  isActive: boolean;
  powiazanie?: string; // Zakładam, że to pole istnieje z poprzednich poprawek
}

export interface Podmiot {
  id: number;
  nazwa: string;
  isActive: boolean;
  
  // === POPRAWKA (Błędy 10 i 11) ===
  // Te pola były wymagane przez podmioty-list.html
  nip: string;
  regon: string;
}

export interface Grupa {
  id: number;
  nazwa: string;
  isActive: boolean;
  podmioty?: Podmiot[]; // To jest potrzebne dla grupa-details
}