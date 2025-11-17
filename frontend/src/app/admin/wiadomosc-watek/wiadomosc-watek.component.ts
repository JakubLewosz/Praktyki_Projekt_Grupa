import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
// Importujemy serwis ORAZ model 'Wiadomosc' i 'Watek'
import { AdminService, Watek, Wiadomosc } from '../../core/services/admin.service';

@Component({
  selector: 'app-wiadomosc-watek',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule 
  ],
  templateUrl: './wiadomosc-watek.component.html',
  styleUrl: './wiadomosc-watek.component.css'
})
export class WiadomoscWatekComponent implements OnInit {

  // === Wejście / Wyjście ===
  @Input() watekId: string | null = null; 
  @Output() powrot = new EventEmitter<void>(); 

  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  // === Sygnały ===
  watek = signal<Watek | null>(null); 
  isLoading = signal(true);

  // === Formularz odpowiedzi ===
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

  // === ZAKTUALIZOWANA FUNKCJA WYSYŁANIA ===
  wyslijOdpowiedz() {
    if (this.odpowiedzForm.invalid) return;

    const trescWiadomosci = this.odpowiedzForm.value.tresc || '';
    
    // Na razie nie wysyłamy do serwisu, tylko TWORZYMY LOKALNĄ ODPOWIEDŹ
    // aby zobaczyć ją na czacie (symulacja)
    
    // 1. Stwórz nową (fałszywą) wiadomość od admina
    const nowaWiadomosc: Wiadomosc = {
      id: `msg_admin_${Math.random()}`, // Losowe ID
      watekId: this.watekId!,
      tresc: trescWiadomosci,
      dataWyslania: new Date().toISOString(), // Data jest teraz
      nazwaNadawcy: "Admin (UKNF)",
      czyAdmin: true // Ważne: to styluje dymek na niebiesko
    };

    // 2. Zaktualizuj sygnał 'watek', dodając nową wiadomość do listy
    this.watek.update(aktualnyWatek => {
      if (!aktualnyWatek) return null;
      
      // Tworzymy nową listę wiadomości (stare + nowa)
      const zaktualizowaneWiadomosci = [...aktualnyWatek.wiadomosci, nowaWiadomosc];
      
      // Zwracamy cały obiekt wątku z nową listą
      return { ...aktualnyWatek, wiadomosci: zaktualizowaneWiadomosci };
    });

    // 3. Wyczyść formularz
    this.odpowiedzForm.reset();

    // TODO: W przyszłości ten kod zostanie zastąpiony przez:
    // this.adminService.wyslijOdpowiedz(this.watekId, trescWiadomosci).subscribe(() => {
    //   this.odpowiedzForm.reset();
    //   this.zaladujWatek(); // Pobierz wątek ponownie, aby zobaczyć prawdziwą odpowiedź
    // });
  }

  // Funkcja do powrotu
  wrocDoListy() {
    this.powrot.emit();
  }
}