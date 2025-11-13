import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Potrzebujemy FormsModule dla [(ngModel)]

// =================================================================
// TYMCZASOWE DANE (Mock Data)
// =================================================================
interface NowaWiadomosc {
  temat: string;
  tresc: string;
  // W prawdziwej aplikacji byłaby tu lista plików
  zalaczniki: any[]; 
}
// =================================================================

@Component({
  selector: 'app-nowa-wiadomosc-form',
  standalone: true,
  imports: [CommonModule, FormsModule], // Dodajemy FormsModule
  templateUrl: './nowa-wiadomosc-form.component.html',
  styleUrl: './nowa-wiadomosc-form.component.css'
})
export class NowaWiadomoscFormComponent {
  // Emitery zdarzeń do rodzica (skrzynka-panel)
  @Output() chceAnulowac = new EventEmitter<void>();
  @Output() chceWyslac = new EventEmitter<NowaWiadomosc>();

  // Dane formularza
  dane = signal<NowaWiadomosc>({
    temat: '',
    tresc: '',
    zalaczniki: []
  });

  wyslij() {
    console.log("UI (Formularz Nowej Wiad.): Kliknięto Wyślij", this.dane());
    // W przyszłości Osoba 3 (API) podepnie tu logikę
    this.chceWyslac.emit(this.dane());
  }

  anuluj() {
    console.log("UI (Formularz Nowej Wiad.): Kliknięto Anuluj");
    this.chceAnulowac.emit();
  }
}