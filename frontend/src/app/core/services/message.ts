import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  CreateThreadRequest, 
  BroadcastMessageRequest, 
  ReplyRequest, 
  ThreadSummary, 
  Message 
} from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  
  private apiUrl = environment.apiUrl; // np. http://localhost:5000/api

  constructor(private http: HttpClient) {}

  // --- 1. Obsługa Załączników (Krok 1: Upload) ---
  
  // Backend: POST /api/Attachments/upload
  // Zwraca ID zapisanego pliku (typ number)
  uploadAttachment(file: File): Observable<number> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<number>(`${this.apiUrl}/Attachments/upload`, formData);
  }

  // --- 2. Obsługa Wiadomości (Krok 2: Wysłanie treści z ID plików) ---

  // Pobieranie wszystkich wątków
  getThreads(): Observable<ThreadSummary[]> {
    return this.http.get<ThreadSummary[]>(`${this.apiUrl}/Threads`);
  }

  // Pobieranie szczegółów wątku
  getThreadDetails(id: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/Threads/${id}`);
  }

  // Tworzenie nowego wątku (Pojedynczy podmiot -> UKNF)
  createThread(data: CreateThreadRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/Threads/create`, data);
  }

  // Masowa wysyłka (UKNF -> Grupa)
  broadcastMessage(data: BroadcastMessageRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/Threads/broadcast`, data);
  }

  // Odpowiedź w wątku
  replyToThread(threadId: number, data: ReplyRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/Threads/${threadId}/reply`, data);
  }
}