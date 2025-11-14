import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs'; // Importujemy 'of' do symulacji
import { delay } from 'rxjs/operators'; // Importujemy 'delay'

// Definicja, jakich danych spodziewa się API
interface NowaWiadomoscPayload {
  temat: string;
  tresc: string;
}

@Injectable({
  providedIn: 'root'
})
export class SkrzynkaService {

  private http = inject(HttpClient);
  // Endpoint dla tego serwisu (np. /api/Skrzynka)
  private apiUrl = `${environment.apiUrl}/Skrzynka`;

  constructor() { }

  // --- WYSYŁANIE WIADOMOŚCI ---
  wyslijNowaWiadomosc(dane: NowaWiadomoscPayload): Observable<any> {
    
    // === Na razie robimy SYMULACJĘ ===
    // Backendowiec musi najpierw stworzyć endpoint POST /api/Skrzynka/wyslij
    
    console.warn('SYMULACJA: Wysyłanie nowej wiadomości.', dane);
    return of({ success: true }).pipe(delay(500)); // Udajemy, że serwer myśli przez 0.5s

    /* // === DOCELOWY KOD (gdy backend będzie gotowy) ===
    return this.http.post(`${this.apiUrl}/wyslij`, dane);
    */
  }

  // TODO: W przyszłości dojdą tu inne metody, np.:
  // getWiadomosci()
  // getWiadomoscById(id: number)
}