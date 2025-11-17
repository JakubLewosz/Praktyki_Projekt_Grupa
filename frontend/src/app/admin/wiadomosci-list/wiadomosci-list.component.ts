import { Component, OnInit, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, WiadomoscWatek } from '../../core/services/admin.service';

@Component({
  selector: 'app-wiadomosci-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wiadomosci-list.component.html',
  styleUrl: './wiadomosci-list.component.css'
})
export class WiadomosciListComponent implements OnInit {

  // Ten @Output() jest poprawny, rodzic (admin-panel) go słucha
  @Output() zobaczWatek = new EventEmitter<string>();

  private adminService = inject(AdminService);

  wiadomosci = signal<WiadomoscWatek[]>([]);
  isLoading = signal(true); 

  ngOnInit() {
    this.pobierzWiadomosci();
  }

  pobierzWiadomosci() {
    this.isLoading.set(true);
    this.adminService.getWiadomosci().subscribe({
      next: (data) => {
        this.wiadomosci.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => { 
        console.error("Błąd pobierania wiadomości:", err);
        alert("Nie udało się pobrać wiadomości.");
        this.isLoading.set(false);
      }
    });
  }

  // === POPRAWKA NAZWY FUNKCJI ===
  // Zmieniamy nazwę metody, aby nie kolidowała z @Output()
  onZobaczWatek(watekId: string) {
    console.log("Lista Wiadomości: Kliknięto 'Zobacz' dla ID:", watekId);
    // Nadal emitujemy event 'zobaczWatek'
    this.zobaczWatek.emit(watekId);
  }
}