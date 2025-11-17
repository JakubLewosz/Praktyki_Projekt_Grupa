import { Injectable } from '@angular/core';
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

  getPodmioty(status: 'all' | 'active' = 'active'): Observable<Podmiot[]> {
    
    let params = new HttpParams();
    
    if (status === 'all') {
      params = params.set('status', 'all');
    }

    return this.http.get<Podmiot[]>(`${this.apiUrl}/podmioty`, { params });
  }

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

  //
  // --- POPRAWKA: Wracamy do PUT (zgodnie z info od backendowca) ---
  //
  disableUser(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${id}/disable`, {});
  }

  //
  // --- POPRAWKA: Wracamy do PUT (zgodnie z info od backendowca) ---
  //
  enableUser(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${id}/enable`, {});
  }

  updatePodmiot(id: number, dane: { nazwa: string, nip: string, regon: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/podmioty/${id}`, dane);
  }

  //
  // --- POPRAWKA: Zmieniam na PUT (zgodnie z Twoim starym Swaggerem) ---
  //
  disablePodmiot(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/podmioty/${id}/disable`, {});
  }

  //
  // --- POPRAWKA: Zmieniam na PUT (zgodnie z Twoim starym Swaggerem) ---
  //
  enablePodmiot(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/podmioty/${id}/enable`, {});
  }

  // --- ZARZĄDZANIE CZŁONKAMI GRUPY ---

  getGrupaById(id: number): Observable<Grupa> {
    return this.http.get<Grupa>(`${this.apiUrl}/grupy/${id}`);
  }

  assignPodmiotToGrupa(podmiotId: number, grupaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign-podmiot-to-grupa`, { podmiotId, grupaId });
  }

  removePodmiotFromGrupa(podmiotId: number, grupaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/grupy/${grupaId}/podmioty/${podmiotId}`);
  }

  // === 5. SYSTEM WIADOMOŚCI (POPRAWIONY) ===
  
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