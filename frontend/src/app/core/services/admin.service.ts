import { Injectable } from '@angular/core';
// ZMIANA: Dodany import HttpParams
import { HttpClient, HttpParams } from '@angular/common/http'; 
import { Observable, of } from 'rxjs'; 
import { delay } from 'rxjs/operators'; 
import { environment } from '../../../environments/environment';
import { User, Podmiot, Grupa, LoginRequest, AuthResponse } from '../models/user.model';

// === INTERFEJSY ZAKTUALIZOWANE POD BACKEND ===

// Pasuje do AdminThreadListDto (zwracane przez GetAllThreads)
export interface WiadomoscWatek {
  id: number; // Zmieniono na number
  temat: string;
  nazwaNadawcy: string;
  nazwaGrupy: string;
  dataOstatniejWiadomosci: string; 
  czyNieprzeczytany: boolean;
}

// Pasuje do AdminMessageDto (część Watek)
export interface Wiadomosc {
  id: number; // Zmieniono na number
  tresc: string;
  dataWyslania: string; 
  autorNazwa: string; // Zmieniono z nazwaNadawcy
  isAdmin: boolean;   // Zmieniono z czyAdmin
  // zalaczniki: any[]; // Można dodać później
}

// Pasuje do AdminThreadDetailsDto (zwracane przez GetThreadDetails)
export interface Watek {
  id: number; // Zmieniono na number
  temat: string;
  nazwaGrupy: string;
  wiadomosci: Wiadomosc[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  
  private apiUrl = `${environment.apiUrl}/Admin`; 
  private authUrl = `${environment.apiUrl}/Auth`; 

  constructor(private http: HttpClient) {}

  // --- Logowanie ---
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, credentials);
  }

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
  createPodmiot(podmiot: { nazwa: string, nip: string, regon: string }): Observable<Podmiot> {
    return this.http.post<Podmiot>(`${this.apiUrl}/podmioty`, podmiot);
  }

  createGrupa(nazwa: string): Observable<Grupa> {
    return this.http.post<Grupa>(`${this.apiUrl}/grupy`, { nazwa });
  }

  createUser(dane: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, dane);
  }

  // --- 3. METODY PUT/POST (Aktualizacja i Status) ---
  updateUser(id: string, dane: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, dane);
  }

  disableUser(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${id}/disable`, {});
  }

  enableUser(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${id}/enable`, {});
  }

  updatePodmiot(id: number, dane: { nazwa: string, nip: string, regon: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/podmioty/${id}`, dane);
  }

  disablePodmiot(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/podmioty/${id}/disable`, {});
  }

  enablePodmiot(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/podmioty/${id}/enable`, {});
  }

  // --- 4. ZARZĄDZANIE CZŁONKAMI GRUPY ---
  getGrupaDetails(id: number): Observable<Grupa> {
    return this.http.get<Grupa>(`${this.apiUrl}/grupy/${id}`);
  }

  addPodmiotToGrupa(podmiotId: number, grupaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/grupy/${grupaId}/podmioty`, { podmiotId });
  }

  removePodmiotFromGrupa(podmiotId: number, grupaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/grupy/${grupaId}/podmioty/${podmiotId}`);
  }

  // === 5. SYSTEM WIADOMOŚCI (POPRAWIONY) ===
  
  // Ten był już poprawny
  getWiadomosci(): Observable<WiadomoscWatek[]> {
    console.log('API: Pobieranie listy wiadomości dla admina.');
    return this.http.get<WiadomoscWatek[]>(`${this.apiUrl}/wiadomosci`);
  }

  // Zmieniono 'id: string' na 'id: number'
  getWatek(id: number): Observable<Watek> {
    console.log(`API: Pobieranie wątku o ID: ${id}`);
    return this.http.get<Watek>(`${this.apiUrl}/wiadomosci/${id}`);
  }

  // Zmieniono 'watekId: string' na 'watekId: number'
  wyslijOdpowiedzAdmina(watekId: number, tresc: string): Observable<any> {
    console.log(`API: Wysyłanie odpowiedzi do wątku: ${watekId}`);
    return this.http.post(`${this.apiUrl}/wiadomosci/${watekId}/odpowiedz`, { tresc });
  }
}