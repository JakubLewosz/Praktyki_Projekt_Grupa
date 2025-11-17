import { Injectable } from '@angular/core';
// ZMIANA: Dodany import HttpParams
import { HttpClient, HttpParams } from '@angular/common/http'; 
import { Observable, of } from 'rxjs'; 
import { delay } from 'rxjs/operators'; 
import { environment } from '../../../environments/environment';
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

  //
  // --- ZAKTUALIZOWANA METODA ---
  //
  /**
   * Pobiera listę podmiotów.
   * @param status 'active' (domyślnie) zwraca tylko aktywne.
   * 'all' zwraca wszystkie (aktywne i nieaktywne).
   */
  getPodmioty(status: 'all' | 'active' = 'active'): Observable<Podmiot[]> {
    
    let params = new HttpParams();
    
    // Ustawiamy parametr 'status' tylko wtedy, gdy NIE JEST 'active'
    // (bo backend i tak domyślnie użyje 'active')
    if (status === 'all') {
      params = params.set('status', 'all');
    }

    // Używamy { params } w opcjach zapytania i silnego typowania Podmiot[]
    return this.http.get<Podmiot[]>(`${this.apiUrl}/podmioty`, { params });
  }
  // --- KONIEC ZAKTUALIZOWANEJ METODY ---
  //

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
    // ZMIANA: Usunięty nieaktualny komentarz, ten endpoint istnieje.
    return this.http.put<void>(`${this.apiUrl}/podmioty/${id}/enable`, {});
  }

  // --- ZARZĄDZANIE CZŁONKAMI GRUPY ---

  // GET /api/Admin/grupy/{id} (Zakładam, że ten endpoint istnieje i zwraca grupę z listą podmiotów)
  getGrupaById(id: number): Observable<Grupa> {
    return this.http.get<Grupa>(`${this.apiUrl}/grupy/${id}`);
  }

  // POST /api/Admin/assign-podmiot-to-grupa (Ten endpoint widzieliśmy w Swaggerze)
  assignPodmiotToGrupa(podmiotId: number, grupaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign-podmiot-to-grupa`, { podmiotId, grupaId });
  }

  // TODO: Poproś backendowca o endpoint do usuwania podmiotu z grupy
  // np. DELETE /api/Admin/remove-podmiot-from-grupa
  removePodmiotFromGrupa(podmiotId: number, grupaId: number): Observable<any> {
    // To jest już prawdziwe zapytanie do API, którego zażądałeś
    return this.http.delete(`${this.apiUrl}/grupy/${grupaId}/podmioty/${podmiotId}`);
  }

}