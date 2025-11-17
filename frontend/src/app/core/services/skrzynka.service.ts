import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Grupa } from '../models/user.model';
import { Watek, WiadomoscWatek } from './admin.service';

@Injectable({
  providedIn: 'root'
})
export class SkrzynkaService {

  private http = inject(HttpClient);
  
  // Ten adres jest poprawny dla wątków
  private threadsApiUrl = `${environment.apiUrl}/Threads`; 
  
  // === POPRAWKA ===
  // Dodajemy poprawny adres dla endpointów '/api/me'
  private meApiUrl = `${environment.apiUrl}/me`; 
  // (Usunęliśmy stary 'grupyApiUrl')

  // === METODY, KTÓRE JUŻ MIELIŚMY ===

  /**
   * 1. Pobieranie grup do formularza
   * (POPRAWKA: Używa teraz 'meApiUrl' i woła GET /api/me/grupy)
   */
  getGrupyDlaUzytkownika(): Observable<Grupa[]> {
    return this.http.get<Grupa[]>(`${this.meApiUrl}/grupy`); 
  }

  // Tworzenie zupełnie nowego wątku
  // (Ten jest poprawny, używa /api/Threads)
  createThread(temat: string, tresc: string, grupaId: number): Observable<any> {
    const payload = { temat, tresc, grupaId, zalacznikIds: [] };
    return this.http.post<any>(`${this.threadsApiUrl}/create`, payload);
  }

  // === METODY DLA WĄTKÓW (Te są już poprawne) ===

  // Pobiera listę wątków użytkownika (GET /api/Threads)
  getMojeWatki(): Observable<WiadomoscWatek[]> {
    return this.http.get<WiadomoscWatek[]>(this.threadsApiUrl); 
  }

  // Pobiera zawartość jednego wątku (GET /api/Threads/{id})
  getWatekDetails(id: number): Observable<Watek> {
    return this.http.get<Watek>(`${this.threadsApiUrl}/${id}`);
  }

  // Wysyła odpowiedź użytkownika (POST /api/Threads/{id}/reply)
  wyslijOdpowiedz(watekId: number, tresc: string): Observable<any> {
    return this.http.post(`${this.threadsApiUrl}/${watekId}/reply`, { tresc });
  }
}