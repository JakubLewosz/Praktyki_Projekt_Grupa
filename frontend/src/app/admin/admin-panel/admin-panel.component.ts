import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importujemy WSZYSTKIE komponenty, które stworzyłeś
import { PodmiotyListComponent } from '../podmioty-list/podmioty-list.component';
import { PodmiotFormComponent } from '../podmiot-form/podmiot-form.component';
import { GrupyListComponent } from '../grupy-list/grupy-list.component';
import { GrupaFormComponent } from '../grupy-form/grupy-form.component';
import { UzytkownicyListComponent } from '../uzytkownicy-list/uzytkownicy-list.component';
import { UzytkownicyFormComponent } from '../uzytkownicy-form/uzytkownicy-form.component';
import { User } from '../../core/models/user.model';
// Definiujemy, jakie mogą być widoki
type WidokGlowny = 'podmioty' | 'grupy' | 'uzytkownicy';
type WidokPodrzedny = 'list' | 'form';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    PodmiotyListComponent,
    PodmiotFormComponent,
    GrupyListComponent,
    GrupaFormComponent,
    UzytkownicyListComponent,
    UzytkownicyFormComponent
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent {
  // Dwa sygnały, które kontrolują WSZYSTKO
  widokGlowny = signal<WidokGlowny>('podmioty');
  widokPodrzedny = signal<WidokPodrzedny>('list');

  // Funkcja do zmiany głównej zakładki (Podmioty, Grupy, Użytkownicy)
  zmienWidokGlowny(widok: WidokGlowny) {
    this.widokGlowny.set(widok);
    this.widokPodrzedny.set('list'); // Zawsze wracaj do listy po zmianie zakładki
  }

  // Funkcja do pokazywania formularza (dla dowolnej zakładki)
  pokazFormularz() {
    this.widokPodrzedny.set('form');
  }

  // Funkcja do pokazywania listy (dla dowolnej zakładki)
  pokazListe() {
    this.widokPodrzedny.set('list');
  }

  // Dodaj nowe pole (sygnał lub zmienną) na edytowanego użytkownika
  edytowanyUzytkownik = signal<User | null>(null);

  // Funkcja obsługująca zdarzenie z listy
  rozpocznijEdycjeUzytkownika(user: User) {
    console.log("2. [ADMIN] Odebrałem usera:", user); // <--- CZY TO WIDZISZ?
    this.edytowanyUzytkownik.set(user);
    this.widokPodrzedny.set('form');
    console.log("3. [ADMIN] Przełączyłem widok na 'form'");   // Przełączamy widok na formularz
  }

  // Funkcja czyszcząca po powrocie z formularza
  zamknijFormularz() {
    this.edytowanyUzytkownik.set(null); // Czyścimy
    this.widokPodrzedny.set('list');    // Wracamy do listy
  }

  // admin-panel.component.ts
  // ... inne sygnały ...

    // 👇 1. Miejsce na przechowywanie edytowanej firmy
    edytowanyPodmiot = signal<any>(null);

    // 👇 2. Funkcja startująca edycję
    rozpocznijEdycjePodmiotu(podmiot: any) {
      this.edytowanyPodmiot.set(podmiot); // Zapisz dane
      this.widokPodrzedny.set('form');    // Pokaż formularz
    }

    // 👇 3. Funkcja czyszcząca (po zapisie lub anulowaniu)
    zamknijFormularzPodmiotu() {
      this.edytowanyPodmiot.set(null);
      this.widokPodrzedny.set('list');
    }
    
    // 👇 4. Zmodyfikuj pokazFormularz, żeby czyścił dane (przy dodawaniu nowego)
  //   pokazFormularz() {
  //     this.edytowanyPodmiot.set(null); // Reset
  //     this.widokPodrzedny.set('form');
  // }
}
