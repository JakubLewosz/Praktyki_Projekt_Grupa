import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
// Używamy Twojej ścieżki do folderu 'wiadomosci'
import { NowaWiadomoscFormComponent } from '../../wiadomosci/nowa-wiadomosc-form/nowa-wiadomosc-form.component';
import { SkrzynkaService } from '../../core/services/skrzynka.service'; // Import serwisu
import { Grupa } from '../../core/models/user.model'; // Import modelu

type WidokSkrzynki = 'lista' | 'formularz';

@Component({
  selector: 'app-skrzynka-panel',
  standalone: true,
  imports: [
    CommonModule, 
    NowaWiadomoscFormComponent 
  ],
  templateUrl: './skrzynka-panel.component.html',
  styleUrl: './skrzynka-panel.component.css'
})
export class SkrzynkaPanelComponent implements OnInit, OnDestroy {

  widok = signal<WidokSkrzynki>('lista'); 
  
  // Przechowujemy listę grup użytkownika
  mojeGrupy = signal<Grupa[]>([]);

  private router = inject(Router);
  private skrzynkaService = inject(SkrzynkaService); // Wstrzykujemy serwis

  // Pobieramy grupy przy ładowaniu panelu
  ngOnInit() {
    window.addEventListener('storage', this.storageEventListener);
    this.ladujMojeGrupy(); // Wywołujemy nową funkcję
  }

  ladujMojeGrupy() {
    this.skrzynkaService.getMojeGrupy().subscribe({
      next: (grupy) => {
        this.mojeGrupy.set(grupy);
      },
      error: (err: any) => {
        console.error("Błąd ładowania grup użytkownika:", err);
        alert("Nie udało się pobrać Twoich grup. Skontaktuj się z adminem.");
      }
    });
  }

  pokazFormularzNowejWiadomosci() {
    this.widok.set('formularz');
  }

  handlePowrotDoListy() {
    this.widok.set('lista');
    // TODO: Odświeżyć listę wysłanych wiadomości
  }

  wyloguj() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  storageEventListener = (event: StorageEvent) => {
    if (event.key === 'token') {
      alert('Zostałeś automatycznie wylogowany z powodu akcji w innej karcie.');
      this.router.navigate(['/login']);
    }
  };

  ngOnDestroy() {
    window.removeEventListener('storage', this.storageEventListener);
  }
}