import { Component, signal, Output, EventEmitter } from '@angular/core'; // <-- DODANE: Output i EventEmitter
import { CommonModule } from '@angular/common';

// ... (Interfejs i MOCK_GRUPY bez zmian) ...
interface Grupa {
  id: number;
  nazwa: string;
  opis: string;
  liczbaPodmiotow: number;
  aktywna: boolean;
}
const MOCK_GRUPY: Grupa[] = [
  { id: 1, nazwa: 'Banki', opis: 'Wszystkie banki komercyjne', liczbaPodmiotow: 12, aktywna: true },
  { id: 2, nazwa: 'Domy Maklerskie', opis: 'Licencjonowane domy maklerskie', liczbaPodmiotow: 25, aktywna: true },
  { id: 3, nazwa: 'Giełdy', opis: 'Giełdy papierów wartościowych', liczbaPodmiotow: 2, aktywna: true },
  { id: 4, nazwa: 'Archiwalna Grupa Testowa', opis: 'Grupa wyłączona', liczbaPodmiotow: 0, aktywna: false },
];

@Component({
  selector: 'app-grupy-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grupy-list.component.html',
  styleUrl: './grupy-list.component.css'
})
export class GrupyListComponent {
  
  // DODANE: Emiter zdarzeń
  @Output() chceDodacNowy = new EventEmitter<void>();

  grupy = signal(MOCK_GRUPY);

  dodajNowaGrupe() {
    console.log("UI (Grupy): Kliknięto 'Dodaj Nową Grupę', emituję zdarzenie.");
    // DODANE: Wysyłamy zdarzenie do rodzica (admin-panel)
    this.chceDodacNowy.emit();
  }

  edytujGrupe(id: number) {
    console.log(`UI (Grupy): Kliknięto 'Edytuj' dla ID: ${id}`);
  }

  wylaczGrupe(id: number) {
    console.log(`UI (Grupy): Kliknięto 'Wyłącz' dla ID: ${id}`);
  }
}