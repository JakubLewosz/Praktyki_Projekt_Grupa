import { Component, signal, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { Grupa } from '../../core/models/user.model'; // Używamy globalnego modelu

@Component({
  selector: 'app-grupy-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grupy-list.component.html',
  styleUrl: './grupy-list.component.css'
})
export class GrupyListComponent implements OnInit { 
  
  private adminService = inject(AdminService);
  
  // === POPRAWKA NAZW, ABY PASOWAŁY DO RODZICA ===
  @Output() dodajNowy = new EventEmitter<void>(); // Zamiast 'chceDodacNowy'
  @Output() zarzadzajGrupa = new EventEmitter<Grupa>(); // Zamiast 'chceZarzadzac'

  grupy = signal<Grupa[]>([]);

  ngOnInit() {
    this.zaladujGrupy();
  }

  zaladujGrupy() {
    this.adminService.getGrupy().subscribe({
      next: (data: Grupa[]) => {
        // Usuwamy "tłumacz danych", bo serwis zwraca już poprawny typ 'Grupa[]'
        this.grupy.set(data);
        console.log("✅ Dane grup pobrane:", data);
      },
      error: (err: any) => console.error("❌ Błąd pobierania grup:", err)
    });
  }

  // Ta funkcja wysyła poprawny event 'dodajNowy'
  dodajGrupe() {
    this.dodajNowy.emit();
  }

  // Ta funkcja wysyła poprawny event 'zarzadzajGrupa'
  zarzadzaj(grupa: Grupa) {
    console.log(`UI (Grupy): Kliknięto 'Zarządzaj' dla: ${grupa.nazwa}`);
    this.zarzadzajGrupa.emit(grupa);
  }

  // Na razie nie mamy logiki zmiany statusu dla grup
}