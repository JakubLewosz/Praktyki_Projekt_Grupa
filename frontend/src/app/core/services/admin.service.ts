import { Injectable } from '@angular/core';
// ZMIANA: Dodany import HttpParams
import { HttpClient, HttpParams } from '@angular/common/http'; 
import { Observable, of } from 'rxjs'; 
import { delay } from 'rxjs/operators'; 
import { environment } from '../../../environments/environment';
// Importujemy modele, których potrzebujemy
import { User, Podmiot, Grupa, LoginRequest, AuthResponse } from '../models/user.model';

// === INTERFEJS DLA LISTY WIADOMOŚCI ===
export interface WiadomoscWatek {
  id: string; // lub number
  temat: string;
  nazwaNadawcy: string; // np. "Sigma (Mbank)"
  nazwaGrupy: string;
  dataOstatniejWiadomosci: string; // Data w formacie ISO
  czyNieprzeczytany: boolean;
}

// === NOWY INTERFEJS (dla pojedynczej wiadomości) ===
export interface Wiadomosc {
  id: string;
  watekId: string;
  tresc: string;
  dataWyslania: string; // ISO string
  nazwaNadawcy: string; // np. "Admin" lub "Sigma (Mbank)"
  czyAdmin: boolean; // true jeśli to odpowiedź admina
}

// === NOWY INTERFEJS (dla całego wątku) ===
export interface Watek {
  id: string;
  temat: string;
  nazwaGrupy: string;
  wiadomosci: Wiadomosc[];
}


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  
  private apiUrl = `${environment.apiUrl}/Admin`; 
  private authUrl = `${environment.apiUrl}/Auth`; // Osobny URL dla logowania

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

  // === 5. SYSTEM WIADOMOŚCI (ADMIN) ===
  
  // Pobieranie listy wszystkich wątków
  getWiadomosci(): Observable<WiadomoscWatek[]> {
    console.warn('SYMULACJA: Pobieranie listy wiadomości dla admina.');
    const symulowaneWiadomosci: WiadomoscWatek[] = [
      {
        id: "watek_123",
        temat: "asdasd", // Temat z Twojego testu
        nazwaNadawcy: "sigma (z Mbank)",
        nazwaGrupy: "Banki", // Grupa z Twojego testu
        dataOstatniejWiadomosci: new Date().toISOString(), // Data jest teraz
        czyNieprzeczytany: true
      },
      {
        id: "watek_124",
        temat: "Inny przykładowy temat",
        nazwaNadawcy: "uzytkownik_pko (z PKO)",
        nazwaGrupy: "Banki",
        dataOstatniejWiadomosci: "2025-11-13T10:30:00Z",
        czyNieprzeczytany: false
      }
    ];
    return of(symulowaneWiadomosci).pipe(delay(500)); 
  }

  // Pobieranie zawartości jednego wątku
  getWatek(id: string): Observable<Watek> {
    console.warn(`SYMULACJA: Pobieranie wątku o ID: ${id}`);

    const symulowanyWatek: Watek = {
      id: "watek_123", 
      temat: "asdasd", 
      nazwaGrupy: "Banki",
      wiadomosci: [
        {
          id: "msg_1",
          watekId: "watek_123",
          tresc: "asda", // Pierwsza wiadomość od sigmy
          dataWyslania: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minut temu
          nazwaNadawcy: "sigma (z Mbank)",
          czyAdmin: false
        }
        // Można dodać symulowaną odpowiedź admina dla testów
        // {
        //   id: "msg_2",
        //   watekId: "watek_123",
        //   tresc: "Otrzymałem wiadomość, dziękuję.",
        //   dataWyslania: new Date().toISOString(), // Teraz
        //   nazwaNadawcy: "Admin (UKNF)",
        //   czyAdmin: true
        // }
      ]
    };
    return of(symulowanyWatek).pipe(delay(500)); 
  }
}