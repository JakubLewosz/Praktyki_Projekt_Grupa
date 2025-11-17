import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, AuthResponse } from '../models/user.model';
import { Router } from '@angular/router';

// Definiujemy, co spodziewamy się znaleźć w tokenie JWT
// Upewnij się u backendowca, że te nazwy (claims) się zgadzają!
export interface DecodedToken {
  nameid: string; // Zazwyczaj ID użytkownika
  email: string;
  role: string; // Rola (np. "Admin", "Podmiot")
  isActive: boolean; // 👈 KLUCZOWE POLE
  exp: number;
  iss: string;
  aud: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private router = inject(Router);
  private http = inject(HttpClient);

  // BehaviorSubject przechowuje aktualną wartość (dane użytkownika) 
  // i powiadamia subskrybentów o zmianach.
  private currentUserSubject = new BehaviorSubject<DecodedToken | null>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor() {
    this.checkInitialLogin();
  }

  /**
   * Sprawdza przy ładowaniu aplikacji, czy w localStorage jest ważny token.
   */
  private checkInitialLogin(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = this.decodeToken(token);
        
        // Sprawdzamy, czy token nie wygasł
        if (decodedUser.exp * 1000 > Date.now()) {
          this.currentUserSubject.next(decodedUser);
        } else {
          // Token wygasł, czyścimy
          this.logout();
        }
      } catch (error) {
        // Błąd dekodowania (np. zły token), czyścimy
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/login`, credentials).pipe(
      tap(response => {
        // Zapisujemy token
        localStorage.setItem('token', response.token);
        
        // Dekodujemy token i powiadamiamy całą aplikację
        try {
          const decodedUser = this.decodeToken(response.token);
          this.currentUserSubject.next(decodedUser);
        } catch (error) {
          console.error("Błąd dekodowania tokenu!", error);
          this.currentUserSubject.next(null);
        }
      })
    );
  }

  /**
   * Wylogowuje użytkownika
   */
  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    // Przekieruj na stronę logowania po wylogowaniu
    this.router.navigate(['/login']); 
  }

  /**
   * Prosta funkcja do dekodowania tokenu JWT (bez zewnętrznych bibliotek)
   */
  private decodeToken(token: string): DecodedToken {
    if (!token) {
      throw new Error("No token provided");
    }
    // Token JWT składa się z 3 części: Header.Payload.Signature
    const payload = token.split('.')[1];
    if (!payload) {
      throw new Error("Invalid token format");
    }
    // Dekodujemy (base64) i parsujemy JSON
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload) as DecodedToken;
  }
}