import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { Grupa } from '../models/user.model'; // Importujemy model Grupy

// Definicja, jakich danych spodziewa się API (z wiadomości backendowca)
interface NowaWiadomoscPayload {
  temat: string;
  tresc: string;
  grupaId: number;
  zalacznikIds: string[]; // lub number[]
}

@Injectable({
  providedIn: 'root'
})
export class SkrzynkaService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`; // Bazowy URL

  constructor() { }

  // === METODA ZAKTUALIZOWANA O ENDPOINT BACKENDU ===
  getMojeGrupy(): Observable<Grupa[]> {
    // Używamy endpointa od backendowca: GET /api/me/grupy
    return this.http.get<Grupa[]>(`${this.apiUrl}/me/grupy`);
  }


  // === METODA ZAKTUALIZOWANA O ENDPOINT BACKENDU ===
  wyslijNowaWiadomosc(dane: NowaWiadomoscPayload): Observable<any> {
    // Używamy endpointa od backendowca: POST /api/threads/create
    const url = `${this.apiUrl}/threads/create`;
    
    console.log('Wysyłanie do API:', url, dane);
    return this.http.post(url, dane);
  }
}