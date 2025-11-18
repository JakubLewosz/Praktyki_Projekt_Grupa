import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms'; 
import { Router } from '@angular/router';
import { SkrzynkaService } from '../../core/services/skrzynka.service';
import { Grupa, Podmiot } from '../../core/models/user.model';
import { Watek, WiadomoscWatek } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth'; 
import { forkJoin } from 'rxjs';
//
// --- POPRAWKA JEST TUTAJ ---
//
import { toSignal } from '@angular/core/rxjs-interop'; // 👈 Brakowało tego importu

type WidokSkrzynki = 'list' | 'watek' | 'form';

@Component({
  selector: 'app-skrzynka-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule 
  ],
  templateUrl: './skrzynka-panel.component.html',
  styleUrl: './skrzynka-panel.component.css'
})
export class SkrzynkaPanelComponent implements OnInit {

  // === INJECT SERWISÓW ===
  private skrzynkaService = inject(SkrzynkaService);
  private authService = inject(AuthService); 
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // === SYGNAŁY ZARZĄDZANIA WIDOKIEM ===
  widok = signal<WidokSkrzynki>('list'); 
  isLoading = signal(true);
  
  // === SYGNAŁY DANYCH ===
  watki = signal<WiadomoscWatek[]>([]);
  aktywnyWatek = signal<Watek | null>(null);
  
  grupy = signal<Grupa[]>([]); 
  listaPodmiotow = signal<Podmiot[]>([]); 

  // === SYGNAŁY ROLI ===
  private currentUser = toSignal(this.authService.currentUser); 
  rolaUzytkownika = computed(() => {
    //
    // --- POPRAWKA BŁĘDU JEST TUTAJ ---
    //
    // Dodaliśmy drugi '?' (opcjonalny chaining), aby bezpiecznie obsłużyć 'role'
    const role = this.currentUser()?.role?.toLowerCase(); 
    //
    // --- KONIEC POPRAWKI ---
    //
    if (role?.includes('admin') || role?.includes('pracownik')) {
      return 'KNF'; 
    }
    return 'Podmiot'; 
  });

  // === FORMULARZE ===
  
  nowyWatekForm = this.fb.group({
    grupaId: [null as number | null], 
    grupyIds: this.fb.array<number>([]),
    podmiotyIds: this.fb.array<number>([]),
    temat: ['', Validators.required],
    tresc: ['', Validators.required]
  });

  odpowiedzForm = this.fb.group({
    tresc: ['', Validators.required]
  });
  
  get grupyFormArray() {
    return this.nowyWatekForm.get('grupyIds') as FormArray;
  }
  get podmiotyFormArray() {
    return this.nowyWatekForm.get('podmiotyIds') as FormArray;
  }

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
    this.nowyWatekForm.reset();
    
    if (this.rolaUzytkownika() === 'KNF') {
      forkJoin({
        grupy: this.skrzynkaService.getWszystkieGrupy(), 
        podmioty: this.skrzynkaService.getWszystkiePodmioty() 
      }).subscribe({
        next: ({ grupy, podmioty }) => {
          this.grupy.set(grupy);
          this.listaPodmiotow.set(podmioty);
          this.isLoading.set(false);
        },
        error: err => this.handleFormLoadError(err)
      });
      
    } else {
      this.skrzynkaService.getGrupyDlaUzytkownika().subscribe({
        next: (data) => {
          this.grupy.set(data);
          this.isLoading.set(false);
        },
        error: err => this.handleFormLoadError(err)
      });
    }
  }

  private handleFormLoadError(err: any) {
    console.error("Błąd pobierania danych dla formularza:", err);
    alert("Nie udało się pobrać danych potrzebnych do wysłania wiadomości.");
    this.isLoading.set(false);
    this.widok.set('list'); 
  }

  stworzNowyWatek() {
    // Poprawka walidacji
    if (this.nowyWatekForm.get('temat')?.invalid || this.nowyWatekForm.get('tresc')?.invalid) {
      alert("Pola Temat i Treść są wymagane.");
      return;
    }
    
    this.isLoading.set(true); 
    const val = this.nowyWatekForm.value;

    if (this.rolaUzytkownika() === 'KNF') {
      const grupyIds = this.grupyFormArray.value;
      const podmiotyIds = this.podmiotyFormArray.value;

      if (grupyIds.length === 0 && podmiotyIds.length === 0) {
        alert("Musisz wybrać co najmniej jedną grupę lub podmiot jako adresata.");
        this.isLoading.set(false);
        return;
      }

      this.skrzynkaService.createThreadKNF(val.temat!, val.tresc!, grupyIds, podmiotyIds).subscribe({
        next: () => this.handleSendSuccess(),
        error: (err) => this.handleSendError(err)
      });

    } else {
      if (!val.grupaId) {
        alert("Musisz wybrać grupę (departament), do którego wysyłasz wiadomość.");
        this.isLoading.set(false);
        return;
      }
      this.skrzynkaService.createThread(val.temat!, val.tresc!, val.grupaId!).subscribe({
        next: () => this.handleSendSuccess(),
        error: (err) => this.handleSendError(err)
      });
    }
  }

  private handleSendSuccess() {
    alert("Wiadomość wysłana pomyślnie!");
    this.nowyWatekForm.reset();
    this.pobierzMojeWatki(); 
  }

  private handleSendError(err: any) {
    console.error("Błąd wysyłania nowej wiadomości:", err);
    alert("Wystąpił błąd podczas wysyłania wiadomości.");
    this.isLoading.set(false);
  }

  // === Metody pomocnicze dla formularza KNF ===
  onGrupaKNFChange(event: Event) {
    this.onCheckboxChange(event, this.grupyFormArray);
  }

  onPodmiotKNFChange(event: Event) {
    this.onCheckboxChange(event, this.podmiotyFormArray);
  }

  private onCheckboxChange(event: Event, formArray: FormArray) {
    const checkEvent = event.target as HTMLInputElement;
    const id = Number(checkEvent.value);
    if (checkEvent.checked) {
      formArray.push(new FormControl(id));
    } else {
      const index = formArray.controls.findIndex(ctrl => ctrl.value === id);
      if (index >= 0) {
        formArray.removeAt(index);
      }
    }
  }

  // === NAWIGACJA ===
  wyloguj() {
    this.authService.logout(); 
  }
}