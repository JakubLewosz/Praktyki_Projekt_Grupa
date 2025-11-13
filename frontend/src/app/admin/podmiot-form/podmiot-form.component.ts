import { Component, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Potrzebujemy FormsModule dla [(ngModel)]

// =================================================================
// TYMCZASOWE INTERFEJSY - Dostarczy je Osoba 3
// =================================================================
interface Podmiot {
  id: number;
  nazwa: string;
  emailKontraktowy: string;
  aktywny: boolean;
  dataUtworzenia: string;
  grupy: string[];
}
// Używamy "Partial", aby móc stworzyć pusty obiekt
type NowyPodmiot = Partial<Podmiot>;
// =================================================================


@Component({
  selector: 'app-podmiot-form',
  standalone: true,
  imports: [CommonModule, FormsModule], // Dodajemy FormsModule
  templateUrl: './podmiot-form.component.html',
  styleUrl: './podmiot-form.component.css'
})
export class PodmiotFormComponent {
  // Ten komponent będzie wysyłał zdarzenia "w górę" do rodzica (app.ts)
  @Output() chceAnulowac = new EventEmitter<void>();
  @Output() chceZapisac = new EventEmitter<NowyPodmiot>();

  // Używamy sygnału do przechowywania danych formularza
  dane = signal<NowyPodmiot>({
    nazwa: '',
    emailKontraktowy: '',
    aktywny: true
  });

  // Logika do symulacji
  zapisz() {
    console.log("UI (Formularz): Kliknięto Zapisz", this.dane());
    // W przyszłości Osoba 3 (API) podłączy tu serwis
    // ...
    // Wysyłamy zdarzenie zapisu
    this.chceZapisac.emit(this.dane());
  }

  anuluj() {
    console.log("UI (Formularz): Kliknięto Anuluj");
    // Wysyłamy zdarzenie anulowania
    this.chceAnulowac.emit();
  }
}