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

  // --- 1. METODY GET (Pobieranie) ---
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getPodmioty(): Observable<Podmiot[]> {
    return this.http.get<Podmiot[]>(`${this.apiUrl}/podmioty`);
  }

  getGrupy(): Observable<Grupa[]> {
    return this.http.get<Grupa[]>(`${this.apiUrl}/grupy`);
  }

  // --- 2. METODY POST (Tworzenie) ---
  createPodmiot(nowyPodmiot: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/podmioty`, nowyPodmiot);
  }

  createGrupa(nowaGrupa: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/grupy`, nowaGrupa);
  }

  createUser(dane: any): Observable<User> {
    // Logika tłumaczenia (np. "Admin" -> 0) jest teraz w komponencie,
    // więc serwis po prostu wysyła gotowe dane.
    return this.http.post<User>(`${this.apiUrl}/users`, dane);
  }

  // --- 3. METODY PUT (Aktualizacja i Status) ---
  updateUser(id: string, dane: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, dane);
  }

  disableUser(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${id}/disable`, {});
  }

  enableUser(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${id}/enable`, {});
  }

  updatePodmiot(id: number, dane: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/podmioty/${id}`, dane);
  }

  disablePodmiot(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/podmioty/${id}/disable`, {});
  }

  enablePodmiot(id: number): Observable<void> {
    // Ten endpoint prawdopodobnie nie istnieje w backendzie (błąd 404),
    // ale zostawiamy go "na zaś".
    return this.http.put<void>(`${this.apiUrl}/podmioty/${id}/enable`, {});
  }

}