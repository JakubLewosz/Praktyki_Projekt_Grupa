import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; 
import { Observable, of } from 'rxjs'; 
import { delay } from 'rxjs/operators'; 
import { environment } from '../../../environments/environment';
import { User, Podmiot, Grupa, LoginRequest, AuthResponse } from '../models/user.model';

// ... (Wszystkie interfejsy WiadomoscWatek, Wiadomosc, Watek... są OK) ...
export interface WiadomoscWatek {
  id: number;
  temat: string;
  nazwaNadawcy: string;
  nazwaGrupy: string;
  dataOstatniejWiadomosci: string; 
  czyNieprzeczytany: boolean;
}
export interface Wiadomosc {
  id: number;
  tresc: string;
  dataWyslania: string; 
  autorNazwa: string;
  isAdmin: boolean; 
}
export interface Watek {
  id: number;
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

  // ... (Metody login, getUsers, getPodmioty, getGrupy, createPodmiot, createGrupa... są OK) ...
  
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, credentials);
  }

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

  createPodmiot(podmiot: { nazwa: string, nip: string, regon: string }): Observable<Podmiot> {
    return this.http.post<Podmiot>(`${this.apiUrl}/podmioty`, podmiot);
  }

  createGrupa(nazwa: string): Observable<Grupa> {
    return this.http.post<Grupa>(`${this.apiUrl}/grupy`, { nazwa });
  }
  
  // --- Metody Usera (Update, Disable, Enable...) są OK ---
  
  createUser(dane: any): Observable<User> {
    // Backend potwierdził, że ten endpoint przyjmuje teraz 'grupyIds'
    return this.http.post<User>(`${this.apiUrl}/users`, dane);
  }

  updateUser(id: string, dane: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, dane);
  }

  disableUser(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${id}/disable`, {});
  }

  enableUser(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${id}/enable`, {});
  }

  // --- Metody Podmiotu (Update, Disable, Enable...) są OK ---
  
  updatePodmiot(id: number, dane: { nazwa: string, nip: string, regon: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/podmioty/${id}`, dane);
  }

  disablePodmiot(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/podmioty/${id}/disable`, {});
  }

  enablePodmiot(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/podmioty/${id}/enable`, {});
  }

  // --- Zarządzanie Grupami (Podmioty) jest OK ---

  getGrupaById(id: number): Observable<Grupa> {
    return this.http.get<Grupa>(`${this.apiUrl}/grupy/${id}`);
  }

  assignPodmiotToGrupa(podmiotId: number, grupaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign-podmiot-to-grupa`, { podmiotId, grupaId });
  }

  removePodmiotFromGrupa(podmiotId: number, grupaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/grupy/${grupaId}/podmioty/${podmiotId}`);
  }

  //
  // --- ZAKTUALIZOWANE METODY (Usunięto symulację) ---
  //

  /**
   * Pobiera listę grup, do których przypisany jest dany użytkownik (Pracownik KNF)
   */
  getGrupyDlaUzytkownika(userId: string): Observable<Grupa[]> {
    // To jest już prawdziwe wywołanie API, które zrobił backendowiec
    return this.http.get<Grupa[]>(`${this.apiUrl}/users/${userId}/grupy`);
  }

  /**
   * Aktualizuje listę grup, do których przypisany jest użytkownik
   */
  updateGrupyDlaUzytkownika(userId: string, grupyIds: number[]): Observable<any> {
    // To jest już prawdziwe wywołanie API, które zrobił backendowiec
    return this.http.put(`${this.apiUrl}/users/${userId}/grupy`, { grupyIds });
  }

  // --- SYSTEM WIADOMOŚCI (bez zmian) ---
  
  getWiadomosci(): Observable<WiadomoscWatek[]> {
    return this.http.get<WiadomoscWatek[]>(`${this.apiUrl}/wiadomosci`);
  }

  getWatek(id: number): Observable<Watek> {
    return this.http.get<Watek>(`${this.apiUrl}/wiadomosci/${id}`);
  }

  wyslijOdpowiedzAdmina(watekId: number, tresc: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/wiadomosci/${watekId}/odpowiedz`, { tresc });
  }
}