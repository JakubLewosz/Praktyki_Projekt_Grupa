import { Component, OnInit, OnDestroy, signal } from '@angular/core'; // <-- Dodajemy signal
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 

// Import formularza, który zaraz stworzymy
import { NowaWiadomoscFormComponent } from '../nowa-wiadomosc-form/nowa-wiadomosc-form.component';

// Definicja typów widoków
type WidokSkrzynki = 'lista' | 'formularz';

@Component({
  selector: 'app-skrzynka-panel',
  standalone: true,
  imports: [
    CommonModule, 
    NowaWiadomoscFormComponent // <-- Dodajemy formularz do importów
  ],
  templateUrl: './skrzynka-panel.component.html',
  styleUrl: './skrzynka-panel.component.css'
})
export class SkrzynkaPanelComponent implements OnInit, OnDestroy {

  // === NOWA LOGIKA WIDOKÓW ===
  widok = signal<WidokSkrzynki>('lista'); // Domyślnie pokazujemy listę

  constructor(private router: Router) {}

  pokazFormularzNowejWiadomosci() {
    this.widok.set('formularz');
  }

  handlePowrotDoListy() {
    this.widok.set('lista');
    // TODO: W przyszłości tutaj odświeżymy listę wiadomości
  }
  // === KONIEC LOGIKI WIDOKÓW ===


  wyloguj() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  // Logika nasłuchiwania (bez zmian)
  storageEventListener = (event: StorageEvent) => {
    if (event.key === 'token') {
      alert('Zostałeś automatycznie wylogowany z powodu akcji w innej karcie.');
      this.router.navigate(['/login']);
    }
  };

  ngOnInit() {
    window.addEventListener('storage', this.storageEventListener);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.storageEventListener);
  }
}