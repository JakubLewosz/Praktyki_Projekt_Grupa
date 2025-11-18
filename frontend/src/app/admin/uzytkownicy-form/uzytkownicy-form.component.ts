import { Component, Output, EventEmitter, inject, Input, OnChanges, SimpleChanges, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { User, Podmiot, Grupa } from '../../core/models/user.model'; 
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-uzytkownicy-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './uzytkownicy-form.component.html',
  styleUrl: './uzytkownicy-form.component.css'
})
export class UzytkownicyFormComponent implements OnChanges, OnInit { 
  
  @Input() userDoEdycji: User | null = null; 
  @Output() powrot = new EventEmitter<void>();
  
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  listaPodmiotow = signal<Podmiot[]>([]);
  listaWszystkichGrup = signal<Grupa[]>([]); 
  isLoading = signal(false); 

  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    rola: ['Pracownik UKNF', Validators.required], 
    password: ['', [Validators.required, Validators.minLength(6)]], 
    podmiotId: [null as number | null],
    grupy: this.fb.array<number>([]) 
  });

  get grupyFormArray() {
    return this.form.get('grupy') as FormArray;
  }

  ngOnInit(): void {
    this.isLoading.set(true);
    forkJoin({
      podmioty: this.adminService.getPodmioty(),
      grupy: this.adminService.getGrupy() 
    }).subscribe({
      next: ({ podmioty, grupy }) => {
        this.listaPodmiotow.set(podmioty);
        this.listaWszystkichGrup.set(grupy);
        this.isLoading.set(false);
        this.ustawFormularz(); 
      },
      error: (err) => {
        console.error('Nie udało się pobrać listy podmiotów lub grup', err);
        this.isLoading.set(false);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userDoEdycji'] && this.listaWszystkichGrup().length > 0) {
      this.ustawFormularz();
    }
  }

  private ustawFormularz(): void {
    if (this.userDoEdycji) {
      // --- TRYB EDYCJI ---
      this.isLoading.set(true);
      this.form.patchValue({
        username: this.userDoEdycji.username,
        email: this.userDoEdycji.email,
        rola: this.userDoEdycji.role 
      });
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.grupyFormArray.clear();

      // Używamy już prawdziwego API (bez symulacji)
      this.adminService.getGrupyDlaUzytkownika(this.userDoEdycji.id).subscribe({
        next: (grupyUzytkownika) => {
          this.listaWszystkichGrup().forEach(grupa => {
            if (grupyUzytkownika.some(g => g.id === grupa.id)) {
              this.grupyFormArray.push(new FormControl(grupa.id));
            }
          });
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Błąd pobierania grup użytkownika', err);
          alert('Backend nie zwrócił grup dla tego użytkownika. Sprawdź, czy serwer działa.');
          this.isLoading.set(false);
        }
      });

    } else {
      // --- TRYB DODAJ NOWY ---
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
      
      this.form.reset({
        username: '',
        email: '',
        rola: 'Pracownik UKNF', 
        password: '',
        podmiotId: null,
        grupy: [] 
      });
      this.grupyFormArray.clear();
    }
  }

  onGrupaChange(event: Event): void {
    const checkEvent = event.target as HTMLInputElement;
    const grupaId = Number(checkEvent.value);

    if (checkEvent.checked) {
      this.grupyFormArray.push(new FormControl(grupaId));
    } else {
      const index = this.grupyFormArray.controls
        .findIndex(ctrl => ctrl.value === grupaId);
      if (index >= 0) {
        this.grupyFormArray.removeAt(index);
      }
    }
  }

  isGrupaChecked(grupaId: number): boolean {
    return this.grupyFormArray.value.includes(grupaId);
  }

  zapisz() {
    if (this.form.invalid) {
      alert('Formularz jest niepoprawny.');
      return;
    }

    const formValue = this.form.value;
    const rolaLiczbowa = this.mapujRoleNaLiczbe(formValue.rola!);
    let podmiotIdDoWysylki: number | null = null;
    let grupyIdsDoWysylki: number[] = [];

    if (rolaLiczbowa === 2) { // 2 = Podmiot
      if (!formValue.podmiotId) {
        alert('Dla roli "Podmiot" musisz wybrać firmę z listy!');
        return; 
      }
      podmiotIdDoWysylki = parseInt(formValue.podmiotId.toString(), 10);
    } 
    
    if (rolaLiczbowa === 1) { // 1 = Pracownik UKNF
      grupyIdsDoWysylki = this.grupyFormArray.value;
    }
    
    const danePodstawowe = {
      username: formValue.username,
      email: formValue.email,
      password: formValue.password,
      rola: rolaLiczbowa,
      podmiotId: podmiotIdDoWysylki 
    };
    
    // Tryb edycji
    if (this.userDoEdycji) { 
      this.isLoading.set(true);
      
      const updateUser$ = this.adminService.updateUser(this.userDoEdycji.id, danePodstawowe);
      const updateGrupy$ = this.adminService.updateGrupyDlaUzytkownika(this.userDoEdycji.id, grupyIdsDoWysylki);

      forkJoin([updateUser$, updateGrupy$]).subscribe({
        next: () => {
          this.isLoading.set(false);
          alert('Zaktualizowano użytkownika i jego grupy!');
          this.powrot.emit();
        },
        error: (err) => {
          this.isLoading.set(false);
          alert('Błąd aktualizacji: ' + (err.message || 'Błąd serwera'))
        }
      });

    } 
    // Tryb dodawania
    else {
      //
      // --- UPROSZCZONA LOGIKA (dzięki backendowcowi) ---
      //
      const daneDoWysylkiCreate = {
        ...danePodstawowe,
        grupyIds: grupyIdsDoWysylki // Dodajemy grupy od razu
      };
      
      this.isLoading.set(true);
      console.log('Wysyłam (Tryb Create):', daneDoWysylkiCreate);

      this.adminService.createUser(daneDoWysylkiCreate).subscribe({
        next: () => {
          this.isLoading.set(false);
          alert('Użytkownik i jego grupy zostały dodane!');
          this.powrot.emit();
        },
        error: (err) => {
          this.isLoading.set(false);
          alert('Błąd dodawania: ' + (err.message || 'Sprawdź, czy hasło jest wystarczająco silne.'))
        }
      });
    }
  }

  anuluj() {
    this.powrot.emit();
  }

  private mapujRoleNaLiczbe(rola: string): number {
    if (rola.toLowerCase().includes('admin')) {
      return 0;
    }
    if (rola.toLowerCase().includes('pracownik')) {
      return 1;
    }
    if (rola.toLowerCase().includes('podmiot')) {
      return 2;
    }
    return 1;
  }
}