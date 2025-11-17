import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
// Importujemy modele (one są już poprawne z admin.service.ts)
import { AdminService, Watek, Wiadomosc } from '../../core/services/admin.service';

@Component({
  selector: 'app-wiadomosc-watek',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './wiadomosc-watek.component.html',
  styleUrl: './wiadomosc-watek.component.css'
})
export class WiadomoscWatekComponent implements OnInit {

  // === POPRAWKA: Zmieniono typ na 'number' ===
  @Input() watekId: number | null = null; 
  @Output() powrot = new EventEmitter<void>(); 

  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  watek = signal<Watek | null>(null); 
  isLoading = signal(true);
  isSending = signal(false); // Sygnał do blokowania przycisku

  odpowiedzForm = this.fb.group({
    tresc: ['', Validators.required]
  });

  ngOnInit() {
    this.zaladujWatek();
  }

  zaladujWatek() {
    if (!this.watekId) {
      alert("Błąd: Nie podano ID wątku.");
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    // === POPRAWKA: Ta funkcja oczekuje już 'number' ===
    this.adminService.getWatek(this.watekId).subscribe({
      next: (data) => {
        this.watek.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error("Błąd ładowania wątku:", err);
        alert("Nie udało się pobrać wątku: " + err.message);
        this.isLoading.set(false);
      }
    });
  }

  // === POPRAWKA: Ta funkcja używa teraz serwisu (i wysyła 'number') ===
  wyslijOdpowiedz() {
    if (this.odpowiedzForm.invalid || this.isSending()) return;

    this.isSending.set(true); 
    const trescWiadomosci = this.odpowiedzForm.value.tresc || '';
    
    // Wywołujemy serwis (który wysyła ID jako 'number')
    this.adminService.wyslijOdpowiedzAdmina(this.watekId!, trescWiadomosci).subscribe({
      next: () => {
        console.log("API: Odpowiedź admina została wysłana.");
        this.odpowiedzForm.reset(); 
        this.isSending.set(false); 
        this.zaladujWatek(); // Odświeżamy wątek, aby zobaczyć nową wiadomość
      },
      error: (err: any) => {
        console.error("Błąd wysyłania odpowiedzi:", err);
        alert("Nie udało się wysłać odpowiedzi: " + err.message);
        this.isSending.set(false); 
      }
    });
  }

  wrocDoListy() {
    this.powrot.emit();
  }
}