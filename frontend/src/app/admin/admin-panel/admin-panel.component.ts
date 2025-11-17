import { Component, signal, ViewChild, OnInit, OnDestroy } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 

// Importy komponentów (bez zmian)
import { PodmiotyListComponent } from '../podmioty-list/podmioty-list.component';
import { GrupyListComponent } from '../grupy-list/grupy-list.component';
import { UzytkownicyListComponent } from '../uzytkownicy-list/uzytkownicy-list.component';
import { PodmiotFormComponent } from '../podmiot-form/podmiot-form.component';
import { GrupaFormComponent } from '../grupy-form/grupy-form.component'; 
import { UzytkownicyFormComponent } from '../uzytkownicy-form/uzytkownicy-form.component';
import { GrupaDetailsComponent } from '../grupy-details/grupa-details.component'; 
import { User, Grupa, Podmiot } from '../../core/models/user.model';


// === POPRAWKA: BRAKUJĄCE DEFINICJE TYPÓW ===
type WidokGlowny = 'podmioty' | 'grupy' | 'uzytkownicy';
type WidokPodrzedny = 'list' | 'form' | 'details'; 
// ==========================================


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
    GrupaDetailsComponent 
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  
  // --- Sygnały i @ViewChild (teraz powinny działać) ---
  widokGlowny = signal<WidokGlowny>('podmioty');
  widokPodrzedny = signal<WidokPodrzedny>('list');
  edytowanyUzytkownik = signal<User | null>(null);
  edytowanyPodmiot = signal<Podmiot | null>(null);
  edytowanaGrupa = signal<Grupa | null>(null); 
  @ViewChild('podmiotList') podmiotListRef?: PodmiotyListComponent;
  @ViewChild('grupaList') grupaListRef?: GrupyListComponent;
  @ViewChild('userList') userListRef?: UzytkownicyListComponent;

  // --- Constructor i Wyloguj (bez zmian) ---
  constructor(private router: Router) {}

  wyloguj() {
    localStorage.removeItem('token'); 
    this.router.navigate(['/login']); 
  }

  // === LOGIKA NASŁUCHIWANIA ZMIAN W PAMIĘCI ===
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
  // === KONIEC LOGIKI NASŁUCHIWANIA ===


  // --- Reszta logiki komponentu (bez zmian) ---
  zmienWidokGlowny(widok: WidokGlowny) { // Ten też już działa
    this.widokGlowny.set(widok);
    this.widokPodrzedny.set('list'); 
  }
  pokazFormularz() {
    this.edytowanyUzytkownik.set(null);
    this.edytowanyPodmiot.set(null);
    this.edytowanaGrupa.set(null);
    this.widokPodrzedny.set('form');
  }
  handlePowrotZFormularza() {
    const aktualnyWidok = this.widokGlowny();
    this.widokPodrzedny.set('list'); 
    this.edytowanyUzytkownik.set(null);
    this.edytowanyPodmiot.set(null);
    this.edytowanaGrupa.set(null);
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
  rozpocznijEdycjeUzytkownika(user: User) {
    this.edytowanyUzytkownik.set(user);
    this.widokPodrzedny.set('form');
  }
  rozpocznijEdycjePodmiotu(podmiot: Podmiot) {
    this.edytowanyPodmiot.set(podmiot); 
    this.widokPodrzedny.set('form');
  }
  rozpocznijZarzadzanieGrupa(grupa: Grupa) {
    this.edytowanaGrupa.set(grupa);
    this.widokPodrzedny.set('details');
  }
}