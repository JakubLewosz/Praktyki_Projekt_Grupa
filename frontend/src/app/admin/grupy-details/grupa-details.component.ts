import { Component, Output, EventEmitter, inject, Input, OnChanges, SimpleChanges, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
// Poprawiony import (zakładając, że oba są w user.model)
import { Podmiot, Grupa } from '../../core/models/user.model'; 

@Component({
  selector: 'app-grupa-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grupa-details.component.html',
  styleUrl: './grupa-details.component.css'
})
export class GrupaDetailsComponent implements OnChanges {
  
  @Input() grupaDoEdycji: Grupa | null = null;
  @Output() powrot = new EventEmitter<void>();
  
  private adminService = inject(AdminService);

  aktualnaGrupa = signal<Grupa | null>(null);
  wszystkiePodmioty = signal<Podmiot[]>([]);
  wybranyPodmiotId = signal<number | null>(null);

  // Sygnał OBLICZENIOWY (bez zmian)
  dostepnePodmioty = computed(() => {
    const czlonkowieIds = this.aktualnaGrupa()?.podmioty?.map(p => p.id) || [];
    return this.wszystkiePodmioty().filter((p: Podmiot) => !czlonkowieIds.includes(p.id));
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (this.grupaDoEdycji) {
      this.zaladujDane();
    }
  }

  zaladujDane() {
    if (!this.grupaDoEdycji) return;

    // Pobieramy dane grupy (z symulacji serwisu)
    this.adminService.getGrupaById(this.grupaDoEdycji.id).subscribe(grupa => {
      this.aktualnaGrupa.set(grupa);
    });

    // Pobieramy WSZYSTKIE podmioty (do listy rozwijanej)
    this.adminService.getPodmioty().subscribe(podmioty => {
      this.wszystkiePodmioty.set(podmioty.filter(p => p.isActive));
    });
  }

  dodajCzlonka() {
    const podmiotId = this.wybranyPodmiotId();
    const grupaId = this.aktualnaGrupa()?.id;

    if (!podmiotId || !grupaId) {
      alert("Wybierz podmiot z listy.");
      return;
    }

    this.adminService.assignPodmiotToGrupa(podmiotId, grupaId).subscribe({
        next: () => {
            alert('Dodano podmiot do grupy!');
            this.zaladujDane(); 
            this.wybranyPodmiotId.set(null);
        },
        error: (err) => alert("Błąd API: " + err.message)
    });
  }

usunCzlonka(podmiotId: number) {
    const grupaId = this.aktualnaGrupa()?.id;
    if (!grupaId) return;
    
    // 1. Pytamy o potwierdzenie
    if (!confirm("Czy na pewno chcesz usunąć ten podmiot z grupy?")) {
      return; 
    }

    // 2. Wołamy PRAWDZIWE API (które właśnie naprawiliśmy w serwisie)
    this.adminService.removePodmiotFromGrupa(podmiotId, grupaId).subscribe({
      next: () => {
        alert('Usunięto podmiot z grupy.');
        
        // 3. Po prostu ładujemy dane od nowa z serwera.
        // To jest teraz czysta i poprawna metoda.
        this.zaladujDane(); 
      },
      error: (err) => {
        console.error("Błąd podczas usuwania członka:", err);
        alert("Wystąpił błąd. Nie udało się usunąć podmiotu.\nTreść błędu: " + err.message);
      }
    });
  }

  anuluj() {
    this.powrot.emit();
  }
}