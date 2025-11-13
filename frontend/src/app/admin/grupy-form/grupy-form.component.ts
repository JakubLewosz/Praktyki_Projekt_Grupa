import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Potrzebujemy FormsModule dla [(ngModel)]

// =================================================================
// TYMCZASOWE INTERFEJSY
// =================================================================
interface Grupa {
  id: number;
  nazwa: string;
  opis: string;
  liczbaPodmiotow: number;
  aktywna: boolean;
}
type NowaGrupa = Partial<Grupa>;
// =================================================================

@Component({
  selector: 'app-grupy-form',
  standalone: true,
  imports: [CommonModule, FormsModule], // Dodajemy FormsModule
  templateUrl: './grupy-form.component.html',
  styleUrl: './grupy-form.component.css'
})
export class GrupyFormComponent {
  // Emitery zdarzeń do rodzica (app.ts)
  @Output() chceAnulowac = new EventEmitter<void>();
  @Output() chceZapisac = new EventEmitter<NowaGrupa>();

  // Dane formularza
  dane = signal<NowaGrupa>({
    nazwa: '',
    opis: '',
    aktywna: true
  });

  zapisz() {
    console.log("UI (Formularz Grupy): Kliknięto Zapisz", this.dane());
    this.chceZapisac.emit(this.dane());
  }

  anuluj() {
    console.log("UI (Formularz Grupy): Kliknięto Anuluj");
    this.chceAnulowac.emit();
  }
}