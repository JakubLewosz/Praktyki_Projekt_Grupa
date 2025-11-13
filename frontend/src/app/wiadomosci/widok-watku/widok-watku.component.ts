import { Component, signal, Input, Output, EventEmitter } from '@angular/core'; // Poprawiona literówka
import { CommonModule } from '@angular/common';

// ... (MOCK_WIDOK_WATKU bez zmian) ...
interface Wiadomosc {
  id: number;
  autor: string;
  tresc: string;
  data: string;
  kierunek: 'ja' | 'oni'; 
  zalaczniki?: { nazwa: string; url: string }[];
}
interface WidokWatku {
  temat: string;
  wiadomosci: Wiadomosc[];
}
const MOCK_WIDOK_WATKU: WidokWatku = {
  temat: 'RE: Zapytanie o audyt wewnętrzny',
  wiadomosci: [
    { id: 1, autor: 'Jan Kowalski (UKNF)', tresc: 'Dzień dobry, w nawiązaniu do poprzedniej korespondencji, prosimy o dosłanie raportu za Q4.', data: new Date(2025, 10, 10, 9, 30).toISOString(), kierunek: 'oni', zalaczniki: [{ nazwa: 'Pismo_UKNF_123.pdf', url: '#' },{ nazwa: 'Zalacznik_do_pisma.docx', url: '#' }] },
    { id: 2, autor: 'Alicja Nowak (Pierwszy Bank Polski)', tresc: 'Dzień dobry, w załączeniu przesyłam wymagany raport. Pozdrawiam.', data: new Date(2025, 10, 12, 11, 15).toISOString(), kierunek: 'ja', zalaczniki: [{ nazwa: 'Raport_Banku_Q4.pdf', url: '#' }] },
    { id: 3, autor: 'Jan Kowalski (UKNF)', tresc: 'Dziękujemy za przesłane materiały. Wrócimy z informacją zwrotną w przyszłym tygodniu.', data: new Date(2025, 10, 12, 14, 0).toISOString(), kierunek: 'oni' }
  ]
};

@Component({
  selector: 'app-widok-watku',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './widok-watku.component.html',
  styleUrl: './widok-watku.component.css'
})
export class WidokWatkuComponent {
  @Output() chceWrocicDoListy = new EventEmitter<void>();

  watek = signal(MOCK_WIDOK_WATKU);
  nowaWiadomoscTresc = signal(''); 

  wrocDoListy() {
    this.chceWrocicDoListy.emit();
  }

  wyslijOdpowiedz() {
    console.log(`UI (Wątek): Wysyłanie odpowiedzi: ${this.nowaWiadomoscTresc()}`);
    this.nowaWiadomoscTresc.set(''); 
  }

  // === NOWA FUNKCJA DO OBSŁUGI POLA TEKSTOWEGO ===
  // Ta funkcja bezpiecznie obsłuży zdarzenie 'input'
  onTekstZmieniony(event: Event) {
    // Rzutujemy 'event.target' na HTMLTextAreaElement, aby TypeScript wiedział, że ma .value
    const target = event.target as HTMLTextAreaElement;
    this.nowaWiadomoscTresc.set(target.value);
  }
}