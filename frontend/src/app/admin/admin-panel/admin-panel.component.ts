import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importujemy WSZYSTKIE komponenty, które stworzyłeś
import { PodmiotyListComponent } from '../podmioty-list/podmioty-list.component';
import { PodmiotFormComponent } from '../podmiot-form/podmiot-form.component';
import { GrupyListComponent } from '../grupy-list/grupy-list.component';
import { GrupyFormComponent } from '../grupy-form/grupy-form.component';
import { UzytkownicyListComponent } from '../uzytkownicy-list/uzytkownicy-list.component';
import { UzytkownicyFormComponent } from '../uzytkownicy-form/uzytkownicy-form.component';

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
    GrupyFormComponent,
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
}