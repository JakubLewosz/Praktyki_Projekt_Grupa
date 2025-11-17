import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
// === POPRAWKA LITERÓWKI ===
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'; // Było '@angularfs'
import { Router } from '@angular/router';
import { SkrzynkaService } from '../../core/services/skrzynka.service';
import { Grupa } from '../../core/models/user.model';
import { Watek, WiadomoscWatek } from '../../core/services/admin.service';

type WidokSkrzynki = 'list' | 'watek' | 'form';

@Component({
  selector: 'app-skrzynka-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule // Teraz ten import zadziała
  ],
  templateUrl: './skrzynka-panel.component.html',
  styleUrl: './skrzynka-panel.component.css'
})
export class SkrzynkaPanelComponent implements OnInit {

  // === INJECT SERWISÓW ===
  private skrzynkaService = inject(SkrzynkaService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // === SYGNAŁY ZARZĄDZANIA WIDOKIEM ===
  widok = signal<WidokSkrzynki>('list'); 
  isLoading = signal(true);
  
  // === SYGNAŁY DANYCH ===
  watki = signal<WiadomoscWatek[]>([]);
  aktywnyWatek = signal<Watek | null>(null);
  grupy = signal<Grupa[]>([]);

  // === FORMULARZE ===
  nowyWatekForm = this.fb.group({
    grupaId: [null as number | null, Validators.required],
    temat: ['', Validators.required],
    tresc: ['', Validators.required]
  });

  odpowiedzForm = this.fb.group({
    tresc: ['', Validators.required]
  });

  // === INICJALIZACJA ===
  ngOnInit() {
    this.pobierzMojeWatki();
  }

  // === METODY DLA WIDOKU 'LIST' ===
  pobierzMojeWatki() {
    this.widok.set('list'); 
    this.isLoading.set(true);
    this.skrzynkaService.getMojeWatki().subscribe({
      next: (data) => {
        this.watki.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Błąd pobierania wątków użytkownika:", err);
        alert("Nie udało się pobrać listy Twoich wiadomości.");
        this.isLoading.set(false);
      }
    });
  }

  // === METODY DLA WIDOKU 'WATEK' (CZAT) ===
  zobaczWatek(watekId: number) {
    this.widok.set('watek'); 
    this.isLoading.set(true);
    this.aktywnyWatek.set(null); 

    this.skrzynkaService.getWatekDetails(watekId).subscribe({
      next: (data) => {
        this.aktywnyWatek.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Błąd pobierania szczegółów wątku:", err);
        alert("Nie udało się pobrać tej rozmowy.");
        this.isLoading.set(false);
        this.widok.set('list'); 
      }
    });
  }

  wyslijOdpowiedz() {
    if (this.odpowiedzForm.invalid || !this.aktywnyWatek()) return;

    const tresc = this.odpowiedzForm.value.tresc || '';
    const watekId = this.aktywnyWatek()!.id;

    this.skrzynkaService.wyslijOdpowiedz(watekId, tresc).subscribe({
      next: () => {
        this.odpowiedzForm.reset();
        this.zobaczWatek(watekId); 
      },
      error: (err) => {
        console.error("Błąd wysyłania odpowiedzi:", err);
        alert("Nie udało się wysłać odpowiedzi.");
      }
    });
  }

  // === METODY DLA WIDOKU 'FORM' (NOWA WIADOMOŚĆ) ===
  pokazFormularzNowejWiadomosci() {
    this.widok.set('form');
    this.isLoading.set(true);
    this.skrzynkaService.getGrupyDlaUzytkownika().subscribe({
      next: (data) => {
        this.grupy.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Błąd pobierania grup:", err);
        alert("Nie udało się pobrać listy grup.");
        this.isLoading.set(false);
        this.widok.set('list'); 
      }
    });
  }

  stworzNowyWatek() {
    if (this.nowyWatekForm.invalid) {
      alert("Wszystkie pola są wymagane.");
      return;
    }
    
    const val = this.nowyWatekForm.value;
    this.isLoading.set(true); 

    this.skrzynkaService.createThread(val.temat!, val.tresc!, val.grupaId!).subscribe({
      next: () => {
        alert("Wiadomość wysłana pomyślnie!");
        this.nowyWatekForm.reset();
        this.pobierzMojeWatki(); 
      },
      error: (err) => {
        console.error("Błąd wysyłania nowej wiadomości:", err);
        alert("Wystąpił błąd podczas wysyłania wiadomości.");
        this.isLoading.set(false);
      }
    });
  }

  // === NAWIGACJA ===
  wyloguj() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}