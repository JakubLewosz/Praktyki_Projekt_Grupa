import { Component, signal, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-podmioty-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './podmioty-list.component.html',
  styleUrl: './podmioty-list.component.css'
})
export class PodmiotyListComponent implements OnInit {
  
  @Output() chceDodacNowy = new EventEmitter<void>();
  podmioty = signal<any[]>([]); // Używamy any[], żeby elastycznie mapować

  @Output() chceEdytowac = new EventEmitter<any>();

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.zaladujPodmioty();
  }

  zaladujPodmioty() {
    this.adminService.getPodmioty().subscribe({
      next: (data: any[]) => {
        console.log("📦 PODMIOTY (Raw):", data);

        // TŁUMACZ DANYCH
        const naprawione = data.map(p => ({
          id: p.id || p.Id,
          // Szukamy nazwy pod różnymi postaciami
          nazwa: p.nazwa || p.Nazwa || p.name || p.Name || 'Bez nazwy',
          // NIP/REGON (jeśli są)
          nip: p.nip || p.Nip || '-',
          regon: p.regon || p.Regon || '-',
          // Status (ta sama logika co przy userach)
          isActive: p.isDisabled !== undefined ? !p.isDisabled : true
        }));

        this.podmioty.set(naprawione);
      },
      error: (err) => console.error("❌ Błąd:", err)
    });
  }
  edytuj(podmiot: any) {
    console.log("✏️ Edycja podmiotu:", podmiot);
    this.chceEdytowac.emit(podmiot);
  }

  dodajPodmiot() { this.chceDodacNowy.emit(); }
  // edytuj(id: any) { console.log("Edycja", id); }
  // zmienStatus(id: any) { console.log("Status", id); }

  // podmioty-list.component.ts

  zmienStatus(podmiot: any) {
    // 1. Sprawdzamy aktualny stan (pamiętaj, że backend wysyła isDisabled, a my zmapowaliśmy to na isActive)
    if (podmiot.isActive) {
      // --- CHCEMY ZABLOKOWAĆ ---
      if(!confirm(`Czy na pewno chcesz zablokować firmę ${podmiot.nazwa}?`)) return;

      this.adminService.disablePodmiot(podmiot.id).subscribe({
        next: () => {
          // Aktualizacja lokalna (szybka)
          this.zaktualizujLokalnie(podmiot.id, false); 
          console.log('⛔ Podmiot zablokowany');
        },
        error: (err) => alert('Błąd blokowania: ' + err.message)
      });

    } else {
      // --- CHCEMY ODBLOKOWAĆ ---
      // Tu jest ryzyko, bo nie widzieliśmy endpointu /enable w Swaggerze
      this.adminService.enablePodmiot(podmiot.id).subscribe({
        next: () => {
          this.zaktualizujLokalnie(podmiot.id, true);
          console.log('✅ Podmiot odblokowany');
        },
        error: (err) => {
          console.error(err);
          alert('Nie udało się odblokować. Czy backend ma endpoint /enable?');
        }
      });
    }
  }

  // Funkcja pomocnicza do odświeżania widoku bez przeładowania
  private zaktualizujLokalnie(id: number, nowyStatus: boolean) {
    this.podmioty.update(lista => 
      lista.map(p => p.id === id ? { ...p, isActive: nowyStatus } : p)
    );
  }
}