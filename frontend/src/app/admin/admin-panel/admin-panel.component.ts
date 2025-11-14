import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importujemy wszystkie komponenty list
import { PodmiotyListComponent } from '../podmioty-list/podmioty-list.component';
import { GrupyListComponent } from '../grupy-list/grupy-list.component';
import { UzytkownicyListComponent } from '../uzytkownicy-list/uzytkownicy-list.component';

// Importujemy wszystkie komponenty formularzy/szczegółów
import { PodmiotFormComponent } from '../podmiot-form/podmiot-form.component';
// Upewnij się, że ścieżka do 'grupa-form' jest poprawna
import { GrupaFormComponent } from '../grupy-form/grupy-form.component'; 
import { UzytkownicyFormComponent } from '../uzytkownicy-form/uzytkownicy-form.component';
// Upewnij się, że ścieżka do 'grupa-details' jest poprawna
import { GrupaDetailsComponent } from '../grupy-details/grupa-details.component'; 

// Importujemy modele
import { User, Grupa, Podmiot } from '../../core/models/user.model';


// Definiujemy, jakie mogą być widoki
type WidokGlowny = 'podmioty' | 'grupy' | 'uzytkownicy';
type WidokPodrzedny = 'list' | 'form' | 'details'; // Dodany 'details'

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
    UzytkownicyFormComponent,
    GrupaDetailsComponent  // Dodany do importów
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent {
  
  // --- SYGNAŁY DO PRZEŁĄCZANIA WIDOKÓW ---
  widokGlowny = signal<WidokGlowny>('podmioty');
  widokPodrzedny = signal<WidokPodrzedny>('list');

  // --- SYGNAŁY DO PRZEKAZYWANIA DANYCH EDYCJI ---
  edytowanyUzytkownik = signal<User | null>(null);
  edytowanyPodmiot = signal<Podmiot | null>(null);
  edytowanaGrupa = signal<Grupa | null>(null); // Dla 'details'

  // --- REFERENCJE DO KOMPONENTÓW LIST (do odświeżania) ---
  @ViewChild('podmiotList') podmiotListRef?: PodmiotyListComponent;
  @ViewChild('grupaList') grupaListRef?: GrupyListComponent;
  @ViewChild('userList') userListRef?: UzytkownicyListComponent;

  // --- LOGIKA PRZEŁĄCZANIA WIDOKÓW ---

  zmienWidokGlowny(widok: WidokGlowny) {
    this.widokGlowny.set(widok);
    this.widokPodrzedny.set('list'); 
  }

  pokazFormularz() {
    // Czyścimy wszystkie dane edycji, gdy klikamy "Dodaj nowy"
    this.edytowanyUzytkownik.set(null);
    this.edytowanyPodmiot.set(null);
    this.edytowanaGrupa.set(null);
    this.widokPodrzedny.set('form');
  }

  // Ta funkcja zamyka formularz i odświeża listę
  handlePowrotZFormularza() {
    const aktualnyWidok = this.widokGlowny();
    this.widokPodrzedny.set('list'); 

    // Czyścimy dane edycji
    this.edytowanyUzytkownik.set(null);
    this.edytowanyPodmiot.set(null);
    this.edytowanaGrupa.set(null);

    // Rozkazujemy odpowiedniej liście, aby załadowała się na nowo
    setTimeout(() => {
      if (aktualnyWidok === 'podmioty' && this.podmiotListRef) {
        this.podmiotListRef.zaladujPodmioty();
      }
      if (aktualnyWidok === 'grupy' && this.grupaListRef) {
        this.grupaListRef.zaladujGrupy();
      }
      if (aktualnyWidok === 'uzytkownicy' && this.userListRef) {
        this.userListRef.pobierzUzytkownikow(); 
      }
    }, 0);
  }

  // --- LOGIKA STARTU EDYCJI / ZARZĄDZANIA ---
  
  rozpocznijEdycjeUzytkownika(user: User) {
    this.edytowanyUzytkownik.set(user);
    this.widokPodrzedny.set('form');
  }

  rozpocznijEdycjePodmiotu(podmiot: Podmiot) {
    this.edytowanyPodmiot.set(podmiot); 
    this.widokPodrzedny.set('form');
  }

  // Funkcja do obsługi przycisku "Zarządzaj"
  rozpocznijZarzadzanieGrupa(grupa: Grupa) {
    console.log("2. [PANEL ADMINA] Odebrałem sygnał, przełączam widok na 'details'");
    this.edytowanaGrupa.set(grupa);
    this.widokPodrzedny.set('details');
  }
}