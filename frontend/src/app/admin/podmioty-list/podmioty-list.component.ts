import { Component, signal, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { Podmiot } from '../../core/models/user.model'; // Upewnij się, że ten import jest poprawny

@Component({
  selector: 'app-podmioty-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './podmioty-list.component.html',
  styleUrl: './podmioty-list.component.css'
})
export class PodmiotyListComponent implements OnInit {
  
  private adminService = inject(AdminService);
  
  // Użyjemy JEDNEJ wersji nazw Outputów.
  // Jeśli rodzic (parent component) oczekuje 'startEdycji', zostaw tak.
  // Jeśli oczekuje 'chceEdytowac', zmień obie nazwy tutaj.
  @Output() dodajNowy = new EventEmitter<void>();
  @Output() startEdycji = new EventEmitter<Podmiot>(); 

  // Używamy silnego typu, ale dane z "Tłumacza" będą 'any'
  podmioty = signal<any[]>([]); 

  ngOnInit() {
    this.zaladujPodmioty();
  }

  //
  // --- CAŁKOWICIE NAPRAWIONA METODA ---
  //
  zaladujPodmioty() {
    // Mamy tylko JEDNO wywołanie, z parametrem 'all'
    this.adminService.getPodmioty('all').subscribe({
      
      // Mimo że serwis mówi, że zwraca Podmiot[], 
      // dane z .NET (PascalCase) muszą być przetłumaczone.
      next: (data: any[]) => { 
        console.log("📦 PODMIOTY (Raw, status=all):", data); 

        // TŁUMACZ DANYCH (jest potrzebny do mapowania np. 'Nazwa' -> 'nazwa')
        const naprawione = data.map(p => ({
          id: p.id || p.Id,
          nazwa: p.nazwa || p.Nazwa || p.name || p.Name || 'Bez nazwy',
          nip: p.nip || p.Nip || '-',
          regon: p.regon || p.Regon || '-',
          isActive: p.isActive 
        }));

        this.podmioty.set(naprawione);
      },
      error: (err: any) => console.error("Błąd pobierania podmiotów:", err)
    });
  } // <-- Ten brakujący nawias był głównym problemem
  
  // Funkcja 'edytuj' musi emitować event 'startEdycji'
  edytuj(podmiot: Podmiot) {
    console.log("✏️ Edycja podmiotu:", podmiot);
    this.startEdycji.emit(podmiot);
  }

  // Funkcja 'dodajPodmiot' musi emitować event 'dodajNowy'
  dodajPodmiot() { 
    this.dodajNowy.emit(); 
  }

  // Typujemy 'podmiot' jako 'any', bo pochodzi z 'naprawione'
  zmienStatus(podmiot: any) {
    if (podmiot.isActive) {
      if(!confirm(`Czy na pewno chcesz zablokować firmę ${podmiot.nazwa}?`)) return;
      
      this.adminService.disablePodmiot(podmiot.id).subscribe({
        next: () => this.zaktualizujLokalnie(podmiot.id, false),
        error: (err: any) => alert('Błąd blokowania: ' + err.message)
      });
    } else {
      if(!confirm(`Czy na pewno chcesz odblokować firmę ${podmiot.nazwa}?`)) return;

      this.adminService.enablePodmiot(podmiot.id).subscribe({ 
        next: () => this.zaktualizujLokalnie(podmiot.id, true),
        error: (err: any) => alert('Błąd odblokowywania: ' + err.message)
      });
    }
  }

  private zaktualizujLokalnie(id: number, nowyStatus: boolean) {
    this.podmioty.update(lista => 
      lista.map(p => p.id === id ? { ...p, isActive: nowyStatus } : p)
    );
  }
}