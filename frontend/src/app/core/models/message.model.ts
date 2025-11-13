// DTO do tworzenia wątku (CreateThreadDto)
export interface CreateThreadRequest {
  grupaId: number;
  podmiotId?: number | null; // Opcjonalne
  temat: string;
  tresc: string;
  zalacznikIds?: number[] | null;
}

// DTO do masowej wysyłki (BroadcastMessageDto)
export interface BroadcastMessageRequest {
  grupaId: number;
  temat: string;
  tresc: string;
  zalacznikIds?: number[] | null;
}

// DTO do odpowiedzi (ReplyToThreadDto)
export interface ReplyRequest {
  tresc: string;
  zalacznikIds?: number[] | null;
}

// To, co przychodzi z GET /api/Threads (Zakładam strukturę na podstawie nazw)
export interface ThreadSummary {
  id: number;
  temat: string;
  ostatniaWiadomoscData: Date;
  czyPrzeczytane: boolean;
  uczestnicy: string[]; // np. nazwy podmiotów
}

export interface Message {
  id: number;
  nadawcaId: number;
  tresc: string;
  dataWyslania: Date;
  zalaczniki: AttachmentView[];
}

export interface AttachmentView {
  id: number;
  nazwaPliku: string;
}