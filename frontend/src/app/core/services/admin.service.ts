import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
// Importujemy poprawne modele z pliku user.model.ts
import { User, Podmiot, Grupa } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  
  // Ustawiamy bazowy adres na /api/Admin
  private apiUrl = `${environment.apiUrl}/Admin`; 

  constructor(private http: HttpClient) {}

  // --- 1. UŻYTKOWNICY (GET /api/Admin/users) ---
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  // --- 2. PODMIOTY (GET /api/Admin/podmioty) ---
  getPodmioty(): Observable<Podmiot[]> {
    return this.http.get<Podmiot[]>(`${this.apiUrl}/podmioty`);
  }

  // --- 3. GRUPY (GET /api/Admin/grupy) ---
  getGrupy(): Observable<Grupa[]> {
    return this.http.get<Grupa[]>(`${this.apiUrl}/grupy`);
  }
    createPodmiot(nowyPodmiot: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/podmioty`, nowyPodmiot);
    }

    createGrupa(nowaGrupa: any): Observable<any> {
    // Zakładam endpoint /api/Admin/grupy
    return this.http.post(`${this.apiUrl}/grupy`, nowaGrupa);
    }
    disableUser(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${id}/disable`, {});
    }

    enableUser(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${id}/enable`, {});
    }

    // ... (istniejące importy i metody getUsers, getPodmioty...)

    // --- DODAWANIE (POST /api/Admin/users) ---
    createUser(dane: any): Observable<User> {
    // Twój Swagger (CreateUserRequestDto) pokazywał 'rola' jako enum (liczba)
    // Musimy zamienić tekst "Admin" na 0.
    const daneDoWysylki = {
        ...dane,
        rola: this.mapujRoleNaLiczbe(dane.rola) 
    };
    return this.http.post<User>(`${this.apiUrl}/users`, daneDoWysylki);
    }

    // --- EDYCJA (PUT /api/Admin/users/{id}) ---
    // (Swagger nie pokazał endpointu do edycji, więc zgaduję, że to PUT na /users/{id})
    updateUser(id: string, dane: any): Observable<User> {
    const daneDoWysylki = {
        ...dane,
        rola: this.mapujRoleNaLiczbe(dane.rola)
    };
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, daneDoWysylki);
    }

    // Funkcja pomocnicza do mapowania roli
    private mapujRoleNaLiczbe(rola: string): number {
    if (rola.toLowerCase().includes('admin')) return 0;
    if (rola.toLowerCase().includes('merytoryczny')) return 1;
    if (rola.toLowerCase().includes('podmiot')) return 2;
    return 1; // Domyślnie
    }

    // wewnątrz klasy AdminService

// USUWANIE (DELETE /api/Admin/users/{id})
    deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
    }

    // --- EDYCJA PODMIOTU (PUT /api/Admin/podmioty/{id}) ---
    updatePodmiot(id: number, dane: any): Observable<any> {
    // Wysyłamy PUT na adres z ID
    return this.http.put(`${this.apiUrl}/podmioty/${id}`, dane);
    }

    disablePodmiot(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/podmioty/${id}/disable`, {});
    }

    // PUT /api/Admin/podmioty/{id}/enable (Zgadujemy, że taki istnieje)
    enablePodmiot(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/podmioty/${id}/enable`, {});
    }
}