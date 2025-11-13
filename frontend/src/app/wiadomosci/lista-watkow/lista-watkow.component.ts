import { Component, signal, Output, EventEmitter } from '@angular/core'; 
import { CommonModule } from '@angular/common';

// =================================================================
// POPRAWIONA, PEŁNA DEFINICJA TYMCZASOWYCH DANYCH
// =================================================================
interface Watek {
  id: number;
  temat: string;
  nadawca: string; // Kto wysłał ostatnią wiadomość
  dataOstWiadomosci: string;
  ostatniaWiadomosc: string; // Fragment
  czyNieprzeczytane: boolean;
}

const MOCK_WATKI: Watek[] = [
  {
    id: 1,
    temat: 'Nowe regulacje dot. sprawozdawczości (Pilne)',
    nadawca: 'UKNF',
    dataOstWiadomosci: new Date(2025, 10, 13, 10, 30).toISOString(),
    ostatniaWiadomosc: 'Prosimy o zapoznanie się z załączonym dokumentem...',
    czyNieprzeczytane: true
  },
  {
    id: 2,
    temat: 'RE: Zapytanie o audyt wewnętrzny',
    nadawca: 'Jan Kowalski (UKNF)',
    dataOstWiadomosci: new Date(2025, 10, 12, 14, 0).toISOString(),
    ostatniaWiadomosc: 'Dziękujemy za przesłane materiały. Wrócimy z informacją...',
    czyNieprzeczytane: false
  },
  {
    id: 3,
    temat: 'Wiadomość testowa (Grupa: Banki)',
    nadawca: 'UKNF',
    dataOstWiadomosci: new Date(2025, 10, 11, 9, 15).toISOString(),
    ostatniaWiadomosc: 'To jest wiadomość wysłana do całej grupy banków.',
    czyNieprzeczytane: false
  },
];
// =================================================================


@Component({
  selector: 'app-lista-watkow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-watkow.component.html',
  styleUrl: './lista-watkow.component.css'
})
export class ListaWatkowComponent {
  
  @Output() chceOtworzycWatek = new EventEmitter<number>();
  @Output() chceDodacNowa = new EventEmitter<void>(); 

  watki = signal(MOCK_WATKI);

  wybierzWatek(id: number) {
    console.log(`UI (Lista Wątków): Wybrano wątek o ID: ${id}, emituję zdarzenie.`);
    this.chceOtworzycWatek.emit(id);
  }

  dodajNowaWiadomosc() {
    console.log("UI (Lista Wątków): Kliknięto 'Nowa Wiadomość', emituję zdarzenie.");
    this.chceDodacNowa.emit();
  }
}