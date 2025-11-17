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

  // === POPRAWKA: Zmieniono typ na 'number' ===
  @Output() zobaczWatek = new EventEmitter<number>();

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
        // Już nie pokazujemy alertu, bo błąd 404 (Not Found) jest teraz obsłużony
        this.isLoading.set(false);
      }
    });
  }

  // === POPRAWKA: Zmieniono typ na 'number' ===
  onZobaczWatek(watekId: number) {
    console.log("Lista Wiadomości: Kliknięto 'Zobacz' dla ID:", watekId);
    this.zobaczWatek.emit(watekId);
  }
}