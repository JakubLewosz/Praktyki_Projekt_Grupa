import { Component, signal, Output, EventEmitter } from '@angular/core'; // <-- Dodajemy Output i EventEmitter
import { CommonModule } from '@angular/common';

// ... (Interfejsy i MOCK_PODMIOTY bez zmian) ...
interface Podmiot {
  id: number;
  nazwa: string;
  emailKontraktowy: string;
  aktywny: boolean;
  dataUtworzenia: string;
  grupy: string[];
}
const MOCK_PODMIOTY: Podmiot[] = [
  { id: 1, nazwa: 'Pierwszy Bank Polski S.A.', emailKontraktowy: 'kontakt@pbp.pl', aktywny: true, dataUtworzenia: new Date(2023, 10, 15).toISOString(), grupy: ['Banki', 'System Płatniczy'] },
  { id: 2, nazwa: 'Giełda Papierów Wartościowych', emailKontraktowy: 'info@gpw.pl', aktywny: true, dataUtworzenia: new Date(2022, 5, 20).toISOString(), grupy: ['Giełdy'] },
  { id: 3, nazwa: 'Stary Bank (Nieaktywny)', emailKontraktowy: 'admin@starybank.pl', aktywny: false, dataUtworzenia: new Date(2021, 1, 1).toISOString(), grupy: ['Banki'] },
  { id: 4, nazwa: 'Dom Maklerski "Pewny Zysk"', emailKontraktowy: 'pewny@zysk.pl', aktywny: true, dataUtworzenia: new Date(2024, 2, 10).toISOString(), grupy: ['Domy Maklerskie'] }
];

@Component({
  selector: 'app-podmioty-list',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './podmioty-list.component.html',
  styleUrl: './podmioty-list.component.css'
})
export class PodmiotyListComponent {
  
  // Tworzymy "emiter" zdarzeń, który powiadomi rodzica (app.ts)
  @Output() chceDodacNowy = new EventEmitter<void>();

  podmioty = signal(MOCK_PODMIOTY);

  dodajNowy() {
    console.log("UI-LISTA: Kliknięto 'Dodaj Nowy', emituję zdarzenie do rodzica.");
    // Wysyłamy zdarzenie w górę
    this.chceDodacNowy.emit(); 
  }

  edytuj(id: number) {
    console.log(`UI: Kliknięto 'Edytuj' dla ID: ${id}`);
    // W przyszłości to też będzie emitować zdarzenie, ale z ID
  }

  wylacz(id: number) {
    console.log(`UI: Kliknięto 'Wyłącz' dla ID: ${id}`);
  }
}