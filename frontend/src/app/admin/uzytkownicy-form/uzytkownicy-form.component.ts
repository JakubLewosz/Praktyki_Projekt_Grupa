import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Potrzebujemy FormsModule dla [(ngModel)]

// =================================================================
// TYMCZASOWE DANE (Mock Data)
// =================================================================
// W przyszłości Osoba 3 (API) dostarczy nam te listy z serwisu
const MOCK_PODMIOTY = [
  { id: 1, nazwa: 'Pierwszy Bank Polski S.A.' },
  { id: 2, nazwa: 'Giełda Papierów Wartościowych' },
  { id: 4, nazwa: 'Dom Maklerski "Pewny Zysk"' }
];
const MOCK_GRUPY = [
  { id: 1, nazwa: 'Banki' },
  { id: 2, nazwa: 'Domy Maklerskie' },
  { id: 3, nazwa: 'Giełdy' }
];

// Interfejs dla formularza
interface UzytkownikForm {
  email: string;
  rola: 'Admin' | 'Merytoryczny' | 'Podmiot' | null;
  aktywny: boolean;
  powiazanieId: number | null; // ID Podmiotu lub Grupy
}
// =================================================================

@Component({
  selector: 'app-uzytkownicy-form',
  standalone: true,
  imports: [CommonModule, FormsModule], // Dodajemy FormsModule
  templateUrl: './uzytkownicy-form.component.html',
  styleUrl: './uzytkownicy-form.component.css'
})
export class UzytkownicyFormComponent {
  // Emitery zdarzeń do rodzica (app.ts)
  @Output() chceAnulowac = new EventEmitter<void>();
  @Output() chceZapisac = new EventEmitter<UzytkownikForm>();

  // Dane formularza
  dane = signal<UzytkownikForm>({
    email: '',
    rola: null, // Zaczynamy od braku wyboru
    aktywny: true,
    powiazanieId: null
  });

  // Udajemy, że te dane przyszły z serwisu
  listaPodmiotow = signal(MOCK_PODMIOTY);
  listaGrup = signal(MOCK_GRUPY);


  zapisz() {
    console.log("UI (Formularz Użytkownika): Kliknięto Zapisz", this.dane());
    this.chceZapisac.emit(this.dane());
  }

  anuluj() {
    console.log("UI (Formularz Użytkownika): Kliknięto Anuluj");
    this.chceAnulowac.emit();
  }
}