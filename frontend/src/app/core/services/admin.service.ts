import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // Usunięto 'of' i 'delay'
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

  // --- Reszta serwisu (getUsers, getPodmioty, itd. bez zmian) ---
  getUsers(): Observable<User[]> { return this.http.get<User[]>(`${this.apiUrl}/users`); }
  getPodmioty(): Observable<Podmiot[]> { return this.http.get<Podmiot[]>(`${this.apiUrl}/podmioty`); }
  getGrupy(): Observable<Grupa[]> { return this.http.get<Grupa[]>(`${this.apiUrl}/grupy`); }
  createPodmiot(podmiot: { nazwa: string, nip: string, regon: string }): Observable<Podmiot> { return this.http.post<Podmiot>(`${this.apiUrl}/podmioty`, podmiot); }
  createGrupa(nazwa: string): Observable<Grupa> { return this.http.post<Grupa>(`${this.apiUrl}/grupy`, { nazwa }); }
  createUser(dane: any): Observable<User> { return this.http.post<User>(`${this.apiUrl}/users`, dane); }
  updateUser(id: string, dane: any): Observable<User> { return this.http.put<User>(`${this.apiUrl}/users/${id}`, dane); }
  disableUser(id: string): Observable<void> { return this.http.post<void>(`${this.apiUrl}/users/${id}/disable`, {}); }
  enableUser(id: string): Observable<void> { return this.http.post<void>(`${this.apiUrl}/users/${id}/enable`, {}); }
  updatePodmiot(id: number, dane: { nazwa: string, nip: string, regon: string }): Observable<any> { return this.http.put(`${this.apiUrl}/podmioty/${id}`, dane); }
  disablePodmiot(id: number): Observable<void> { return this.http.post<void>(`${this.apiUrl}/podmioty/${id}/disable`, {}); }
  enablePodmiot(id: number): Observable<void> { return this.http.post<void>(`${this.apiUrl}/podmioty/${id}/enable`, {}); }
  getGrupaDetails(id: number): Observable<Grupa> { return this.http.get<Grupa>(`${this.apiUrl}/grupy/${id}`); }
  addPodmiotToGrupa(podmiotId: number, grupaId: number): Observable<any> { return this.http.post(`${this.apiUrl}/grupy/${grupaId}/podmioty`, { podmiotId }); }
  removePodmiotFromGrupa(podmiotId: number, grupaId: number): Observable<any> { return this.http.delete(`${this.apiUrl}/grupy/${grupaId}/podmioty/${podmiotId}`); }

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