import { Component, signal, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { Podmiot } from '../../core/models/user.model'; // <-- WAŻNE: Dodaj ten import

@Component({
  selector: 'app-podmioty-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './podmioty-list.component.html',
  styleUrl: './podmioty-list.component.css'
})
export class PodmiotyListComponent implements OnInit {
  
  private adminService = inject(AdminService);
  
  // === POPRAWKA NAZW, ABY PASOWAŁY DO RODZICA ===
  @Output() dodajNowy = new EventEmitter<void>(); // Zamiast 'chceDodacNowy'
  @Output() startEdycji = new EventEmitter<Podmiot>(); // Zamiast 'chceEdytowac'

  // Używamy typu 'Podmiot[]' zamiast 'any[]'
  podmioty = signal<Podmiot[]>([]); 

  ngOnInit() {
    this.zaladujPodmioty();
  }

  zaladujPodmioty() {
    this.adminService.getPodmioty().subscribe({
      next: (data: Podmiot[]) => {
        // Nie potrzebujemy już "tłumacza danych", serwis zwraca poprawny typ
        this.podmioty.set(data); 
    //
    // --- JEDYNA ZMIANA JEST TUTAJ (dodanie 'all') ---
    //
    this.adminService.getPodmioty('all').subscribe({
      next: (data: any[]) => {
        console.log("📦 PODMIOTY (Raw, status=all):", data); 

        // TŁUMACZ DANYCH (z poprawką)
        const naprawione = data.map(p => ({
          id: p.id || p.Id,
          nazwa: p.nazwa || p.Nazwa || p.name || p.Name || 'Bez nazwy',
          nip: p.nip || p.Nip || '-',
          regon: p.regon || p.Regon || '-',
          
          // Czytamy bezpośrednio 'isActive' z API
          isActive: p.isActive 
        }));

        this.podmioty.set(naprawione);
      },
      error: (err: any) => console.error("Błąd pobierania podmiotów:", err)
    });
  }
  
  // Ta funkcja musi wysyłać event 'startEdycji'
  edytuj(podmiot: Podmiot) {
    console.log("✏️ Edycja podmiotu:", podmiot);
    this.startEdycji.emit(podmiot);
  }

  // Ta funkcja musi wysyłać event 'dodajNowy'
  dodajPodmiot() { 
    this.dodajNowy.emit(); 
  }

  // Typujemy 'podmiot' jako 'Podmiot'
  zmienStatus(podmiot: Podmiot) {
    if (podmiot.isActive) {
      if(!confirm(`Czy na pewno chcesz zablokować firmę ${podmiot.nazwa}?`)) return;
      this.adminService.disablePodmiot(podmiot.id).subscribe({
        next: () => this.zaktualizujLokalnie(podmiot.id, false),
        error: (err: any) => alert('Błąd blokowania: ' + err.message)
      });
    } else {
      if(!confirm(`Czy na pewno chcesz odblokować firmę ${podmiot.nazwa}?`)) return;
      // Zakładamy, że 'enablePodmiot' jest już poprawione w serwisie
      this.adminService.enablePodmiot(podmiot.id).subscribe({ 
        next: () => this.zaktualizujLokalnie(podmiot.id, true),
        error: (err: any) => alert('Błąd odblokowywania: ' + err.message)
      });
    }
  }

  // Funkcja pomocnicza bez zmian
  private zaktualizujLokalnie(id: number, nowyStatus: boolean) {
    this.podmioty.update(lista => 
      lista.map(p => p.id === id ? { ...p, isActive: nowyStatus } : p)
    );
  }
}