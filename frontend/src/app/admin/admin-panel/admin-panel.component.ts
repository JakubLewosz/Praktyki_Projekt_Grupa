import { Component, signal, ViewChild, OnInit, OnDestroy, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { PodmiotyListComponent } from '../podmioty-list/podmioty-list.component';
import { GrupyListComponent } from '../grupy-list/grupy-list.component';
import { UzytkownicyListComponent } from '../uzytkownicy-list/uzytkownicy-list.component';
import { PodmiotFormComponent } from '../podmiot-form/podmiot-form.component';
import { GrupaFormComponent } from '../grupy-form/grupy-form.component'; 
import { UzytkownicyFormComponent } from '../uzytkownicy-form/uzytkownicy-form.component';
import { GrupaDetailsComponent } from '../grupy-details/grupa-details.component'; 
import { User, Grupa, Podmiot } from '../../core/models/user.model';
import { WiadomosciListComponent } from '../wiadomosci-list/wiadomosci-list.component';
import { WiadomoscWatekComponent } from '../wiadomosc-watek/wiadomosc-watek.component';

type WidokGlowny = 'podmioty' | 'grupy' | 'uzytkownicy' | 'wiadomosci';
type WidokPodrzedny = 'list' | 'form' | 'details' | 'watek'; 

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule, PodmiotyListComponent, PodmiotFormComponent, GrupyListComponent,
    GrupaFormComponent, UzytkownicyListComponent, UzytkownicyFormComponent,
    GrupaDetailsComponent, WiadomosciListComponent, WiadomoscWatekComponent 
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  
  private router = inject(Router);

  widokGlowny = signal<WidokGlowny>('wiadomosci'); 
  widokPodrzedny = signal<WidokPodrzedny>('list');
  
  // === POPRAWKA: Zmieniono typ na 'number' ===
  wybranyWatekId = signal<number | null>(null);

  edytowanyUzytkownik = signal<User | null>(null);
  edytowanyPodmiot = signal<Podmiot | null>(null);
  edytowanaGrupa = signal<Grupa | null>(null); 
  
  @ViewChild('podmiotList') podmiotListRef?: PodmiotyListComponent;
  @ViewChild('grupaList') grupaListRef?: GrupyListComponent;
  @ViewChild('userList') userListRef?: UzytkownicyListComponent;
  @ViewChild('wiadomosciList') wiadomosciListRef?: WiadomosciListComponent;

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

  ngOnInit() {
    window.addEventListener('storage', this.storageEventListener);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.storageEventListener);
  }

  zmienWidokGlowny(widok: WidokGlowny) {
    this.widokGlowny.set(widok);
    this.widokPodrzedny.set('list'); 
    this.wybranyWatekId.set(null); 
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
    this.wybranyWatekId.set(null); 
    
    setTimeout(() => {
      if (aktualnyWidok === 'podmioty' && this.podmiotListRef) this.podmiotListRef.zaladujPodmioty();
      if (aktualnyWidok === 'grupy' && this.grupaListRef) this.grupaListRef.zaladujGrupy();
      if (aktualnyWidok === 'uzytkownicy' && this.userListRef) this.userListRef.pobierzUzytkownikow(); 
      if (aktualnyWidok === 'wiadomosci' && this.wiadomosciListRef) this.wiadomosciListRef.pobierzWiadomosci();
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

  // === POPRAWKA: Zmieniono typ na 'number' ===
  zobaczWatek(watekId: number) {
    console.log("Admin Panel: Przełączam na widok wątku, ID:", watekId);
    this.wybranyWatekId.set(watekId); 
    this.widokPodrzedny.set('watek'); 
  }
}