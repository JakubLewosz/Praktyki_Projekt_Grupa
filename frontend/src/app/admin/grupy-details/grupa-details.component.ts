import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// WAŻNE: Potrzebujemy ReactiveFormsModule do formularza dodawania
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'; 
import { AdminService } from '../../core/services/admin.service';
import { Grupa, Podmiot } from '../../core/models/user.model';

@Component({
  selector: 'app-grupa-details',
  standalone: true,
  // WAŻNE: Dodajemy ReactiveFormsModule do importów
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './grupa-details.component.html',
  styleUrl: './grupa-details.component.css'
})
export class GrupaDetailsComponent implements OnInit {

  // === POPRAWKA: Ten @Input() naprawia błąd "Can't bind to 'grupa'" ===
  @Input() grupa!: Grupa;
  @Output() powrot = new EventEmitter<void>();
  
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  // Sygnały do przechowywania danych
  aktualnaGrupa = signal<Grupa | null>(null); 
  wszystkiePodmioty = signal<Podmiot[]>([]);

  // Formularz do dodawania nowego członka
  form = this.fb.group({
    podmiotId: [null as number | null, Validators.required]
  });

  ngOnInit() {
    this.zaladujDane();
  }

  zaladujDane() {
    if (!this.grupa) return;

    // === POPRAWKA: Używamy poprawnej nazwy 'getGrupaDetails' ===
    this.adminService.getGrupaById(this.grupa.id).subscribe({
      next: (data) => this.aktualnaGrupa.set(data),
      error: (err: any) => alert('Nie udało się pobrać szczegółów grupy: ' + err.message)
    });

    // Pobieramy listę wszystkich podmiotów (do listy rozwijanej)
    this.adminService.getPodmioty().subscribe({
      next: (data) => this.wszystkiePodmioty.set(data),
      error: (err: any) => alert('Nie udało się pobrać listy podmiotów: ' + err.message)
    });
  }

  dodajCzlonka() {
    if (this.form.invalid) {
      alert('Musisz wybrać podmiot z listy.');
      return;
    }
    
    const podmiotId = this.form.value.podmiotId!;
    const grupaId = this.aktualnaGrupa()?.id;
    if (!grupaId) return;

    // === POPRAWKA: Używamy poprawnej nazwy 'addPodmiotToGrupa' ===
    this.adminService.assignPodmiotToGrupa(podmiotId, grupaId).subscribe({
      next: () => {
        alert('Dodano podmiot do grupy!');
        this.form.reset(); // Czyścimy formularz
        this.zaladujDane(); // Odświeżamy dane
      },
      error: (err: any) => {
        console.error("Błąd dodawania członka:", err);
        alert("Wystąpił błąd: " + err.message);
      }
    });
  }

  usunCzlonka(podmiotId: number) {
    const grupaId = this.aktualnaGrupa()?.id;
    if (!grupaId) return;
    
    if (!confirm("Czy na pewno chcesz usunąć ten podmiot z grupy?")) {
      return; 
    }

    this.adminService.removePodmiotFromGrupa(podmiotId, grupaId).subscribe({
      next: () => {
        alert('Usunięto podmiot z grupy.');
        this.zaladujDane(); // Odświeżamy dane
      },
      error: (err: any) => {
        console.error("Błąd podczas usuwania członka:", err);
        alert("Wystąpił błąd: " + err.message);
      }
    });
  }

  anuluj() {
    this.powrot.emit();
  }
}