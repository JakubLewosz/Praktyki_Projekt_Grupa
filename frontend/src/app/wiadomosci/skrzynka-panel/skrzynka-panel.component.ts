import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importujemy WSZYSTKIE trzy komponenty
import { ListaWatkowComponent } from '../lista-watkow/lista-watkow.component';
import { WidokWatkuComponent } from '../widok-watku/widok-watku.component';
import { NowaWiadomoscFormComponent } from '../nowa-wiadomosc-form/nowa-wiadomosc-form.component'; // <-- NOWY

@Component({
  selector: 'app-skrzynka-panel',
  standalone: true,
  imports: [
    CommonModule,
    ListaWatkowComponent,
    WidokWatkuComponent,
    NowaWiadomoscFormComponent // <-- NOWY
  ],
  templateUrl: './skrzynka-panel.component.html',
  styleUrl: './skrzynka-panel.component.css'
})
export class SkrzynkaPanelComponent {
  // Zaktualizowany sygnał: teraz ma TRZY stany
  widok = signal<'lista' | 'watek' | 'nowa'>('lista');

  wybranyWatekId = signal<number | null>(null);

  // --- Funkcje do przełączania widoków ---

  otworzWatek(id: number) {
    this.wybranyWatekId.set(id);
    this.widok.set('watek');
  }

  // NOWA FUNKCJA
  pokazFormularzNowejWiadomosci() {
    this.widok.set('nowa');
  }

  // Ta funkcja będzie używana przez 2 komponenty, aby wrócić do listy
  wrocDoListy() {
    this.wybranyWatekId.set(null);
    this.widok.set('lista');
  }
}