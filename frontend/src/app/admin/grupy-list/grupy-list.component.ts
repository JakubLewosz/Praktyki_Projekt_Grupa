import { Component, signal, Output, EventEmitter, OnInit } from '@angular/core';
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
export class GrupyListComponent implements OnInit { // Dodajemy OnInit
  
  @Output() chceDodacNowy = new EventEmitter<void>();
  
  // Zmieniamy 'edytuj' na 'zarzadzaj' i typujemy poprawnym modelem
  @Output() chceZarzadzac = new EventEmitter<Grupa>();

  // Zaczynamy z pustą listą, którą wypełni API
  grupy = signal<Grupa[]>([]);

  // Wstrzykujemy serwis
  constructor(private adminService: AdminService) {}

  // Pobieramy dane przy starcie komponentu
  ngOnInit() {
    this.zaladujGrupy();
  }

  zaladujGrupy() {
    this.adminService.getGrupy().subscribe({
      next: (data: any[]) => {
        console.log("📦 GRUPY (Raw):", data);

        // Tłumacz danych (na wszelki wypadek)
        const naprawione = data.map(g => ({
          id: g.id || g.Id,
          nazwa: g.nazwa || g.Nazwa || g.name || g.Name || 'Bez nazwy',
          isActive: g.isActive !== undefined ? g.isActive : (g.isDisabled !== undefined ? !g.isDisabled : true),
          // Backend nie zwraca liczby podmiotów w liście, więc sami to ustawimy
          liczbaPodmiotow: g.podmioty ? g.podmioty.length : 0 
        }));

        this.grupy.set(naprawione);
      },
      error: (err) => console.error("❌ Błąd:", err)
    });
  }

  // Zmieniamy nazwę funkcji, żeby pasowała do logiki
  dodajGrupe() {
    this.chceDodacNowy.emit();
  }

  // Ta funkcja zastępuje 'edytujGrupe'
  zarzadzaj(grupa: Grupa) {
    console.log(`UI (Grupy): Kliknięto 'Zarządzaj' dla: ${grupa.nazwa}`);
    this.chceZarzadzac.emit(grupa);
  }

  // Usuwamy 'wylaczGrupe', bo API (ze Swaggera) nie ma endpointu /disable dla Grup
  // Jeśli backendowiec go dorobi, możemy tu wrócić i dodać tę funkcję.
}