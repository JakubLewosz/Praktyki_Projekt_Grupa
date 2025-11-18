import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs'; 
import { environment } from '../../../environments/environment';
import { Grupa, Podmiot } from '../models/user.model';
import { Watek, WiadomoscWatek } from './admin.service'; // Współdzielimy interfejsy

@Injectable({
  providedIn: 'root'
})
export class SkrzynkaService {

  private http = inject(HttpClient);
  
  // === POPRAWIONE ŚCIEŻKI API (z Twojego pliku) ===
  private threadsApiUrl = `${environment.apiUrl}/Threads`; 
  private meApiUrl = `${environment.apiUrl}/me`; 
  
  // === DODANE ŚCIEŻKI (potrzebne dla roli KNF) ===
  private adminApiUrl = `${environment.apiUrl}/Admin`; 
  // Ten URL 'knfApiUrl' nie jest już potrzebny, bo backendowiec
  // umieścił nowy endpoint w 'threadsApiUrl'

  constructor() {}

  // === Metody dla obu ról (używają /api/Threads) ===

  getMojeWatki(): Observable<WiadomoscWatek[]> {
    // Ten endpoint jest już "mądry" i filtruje po roli
    return this.http.get<WiadomoscWatek[]>(this.threadsApiUrl); 
  }

  getWatekDetails(watekId: number): Observable<Watek> {
    return this.http.get<Watek>(`${this.threadsApiUrl}/${watekId}`);
  }

  wyslijOdpowiedz(watekId: number, tresc: string): Observable<any> {
    return this.http.post(`${this.threadsApiUrl}/${watekId}/reply`, { tresc });
  }

  // === Metody dla formularza "Nowa Wiadomość" (specyficzne dla roli) ===

  // 1. Dla Użytkownika Podmiotu
  getGrupyDlaUzytkownika(): Observable<Grupa[]> {
    return this.http.get<Grupa[]>(`${this.meApiUrl}/grupy`); 
  }

  // 2. Dla Użytkownika Podmiotu
  createThread(temat: string, tresc: string, grupaId: number): Observable<any> {
    const payload = { temat, tresc, grupaId, zalacznikIds: [] }; 
    return this.http.post<any>(`${this.threadsApiUrl}/create`, payload);
  }

  //
  // === METODY DLA KNF (Z AKTUALIZACJĄ) ===
  //

  // 3. Dla Pracownika KNF
  getWszystkieGrupy(): Observable<Grupa[]> {
    return this.http.get<Grupa[]>(`${this.adminApiUrl}/grupy`);
  }
  
  // 4. Dla Pracownika KNF
  getWszystkiePodmioty(): Observable<Podmiot[]> {
    return this.http.get<Podmiot[]>(`${this.adminApiUrl}/podmioty?status=active`);
  }

  // 5. Dla Pracownika KNF
  //
  // --- ZMIANA JEST TUTAJ ---
  //
  createThreadKNF(temat: string, tresc: string, grupyIds: number[], podmiotyIds: number[]): Observable<any> {
    // Używamy endpointu, który podał backendowiec: /api/Threads/knf/create
    const payload = { temat, tresc, grupyIds, podmiotyIds };
    return this.http.post(`${this.threadsApiUrl}/knf/create`, payload);
  }
}