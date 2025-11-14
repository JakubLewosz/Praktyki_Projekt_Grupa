import { Component, signal, ViewChild } from '@angular/core'; // 👈 Dodaj ViewChild
import { CommonModule } from '@angular/common';

// Importujemy WSZYSTKIE komponenty
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
  
  // --- SYGNAŁY DO PRZEŁĄCZANIA WIDOKÓW ---
  widokGlowny = signal<WidokGlowny>('podmioty');
  widokPodrzedny = signal<WidokPodrzedny>('list');

  // --- SYGNAŁY DO PRZEKAZYWANIA DANYCH EDYCJI ---
  edytowanyUzytkownik = signal<User | null>(null);
  edytowanyPodmiot = signal<any>(null); // Użyj modelu Podmiot, jeśli masz

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
    // Czyścimy dane edycji, gdy klikamy "Dodaj nowy"
    this.edytowanyUzytkownik.set(null);
    this.edytowanyPodmiot.set(null);
    this.widokPodrzedny.set('form');
  }

  // --- KLUCZOWA POPRAWKA: Ta funkcja odświeża listę po powrocie z formularza ---
  handlePowrotZFormularza() {
    this.widokPodrzedny.set('list'); // 1. Wróć do widoku listy

    // 2. Rozkaż odpowiedniej liście, aby załadowała się na nowo
    // (Używamy setTimeout, aby dać Angularowi czas na przełączenie widoku)
    setTimeout(() => {
      const aktualnyWidok = this.widokGlowny();
      
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

  // --- LOGIKA EDYCJI (bez zmian, już działała) ---
  
  rozpocznijEdycjeUzytkownika(user: User) {
    this.edytowanyUzytkownik.set(user);
    this.widokPodrzedny.set('form');
  }

  rozpocznijEdycjePodmiotu(podmiot: any) {
    this.edytowanyPodmiot.set(podmiot); 
    this.widokPodrzedny.set('form');
  }
}