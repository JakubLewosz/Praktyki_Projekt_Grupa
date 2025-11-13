import { Component, signal, Output, EventEmitter } from '@angular/core'; // <-- DODANE: Output i EventEmitter
import { CommonModule } from '@angular/common';

// ... (Interfejs i MOCK_UZYTKOWNICY bez zmian) ...
interface Uzytkownik {
  id: number;
  email: string;
  rola: 'Admin' | 'Merytoryczny' | 'Podmiot';
  powiazanie: string;
  aktywny: boolean;
}
const MOCK_UZYTKOWNICY: Uzytkownik[] = [
  { id: 1, email: 'admin@uknf.gov.pl', rola: 'Admin', powiazanie: 'Panel Admina', aktywny: true },
  { id: 2, email: 'jan.kowalski@uknf.gov.pl', rola: 'Merytoryczny', powiazanie: 'Grupa: Banki', aktywny: true },
  { id: 3, email: 'anna.nowak@uknf.gov.pl', rola: 'Merytoryczny', powiazanie: 'Grupa: Domy Makl.', aktywny: true },
  { id: 4, email: 'kontakt@pbp.pl', rola: 'Podmiot', powiazanie: 'Podmiot: PBP S.A.', aktywny: true },
  { id: 5, email: 'audyt@gpw.pl', rola: 'Podmiot', powiazanie: 'Podmiot: GPW', aktywny: true },
  { id: 6, email: 'byly.pracownik@uknf.gov.pl', rola: 'Merytoryczny', powiazanie: 'Brak', aktywny: false },
];

@Component({
  selector: 'app-uzytkownicy-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './uzytkownicy-list.component.html',
  styleUrl: './uzytkownicy-list.component.css'
})
export class UzytkownicyListComponent {
  
  // DODANE: Emiter zdarzeń
  @Output() chceDodacNowy = new EventEmitter<void>();

  uzytkownicy = signal(MOCK_UZYTKOWNICY);

  dodajNowegoUzytkownika() {
    console.log("UI (Użytkownicy): Kliknięto 'Dodaj Nowego Użytkownika', emituję zdarzenie.");
    // DODANE: Wysyłamy zdarzenie do rodzica (admin-panel)
    this.chceDodacNowy.emit();
  }

  edytujUzytkownika(id: number) {
    console.log(`UI (Użytkownicy): Kliknięto 'Edytuj' dla ID: ${id}`);
  }

  wylaczUzytkownika(id: number) {
    console.log(`UI (Użytkownicy): Kliknięto 'Wyłącz' dla ID: ${id}`);
  }
}