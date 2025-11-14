import { Component, Output, EventEmitter, inject, Input, OnChanges, SimpleChanges, OnInit, signal } from '@angular/core'; // Dodaj OnInit, signal
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { User, Podmiot } from '../../core/models/user.model'; 


@Component({
  selector: 'app-uzytkownicy-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './uzytkownicy-form.component.html',
  styleUrl: './uzytkownicy-form.component.css'
})
export class UzytkownicyFormComponent implements OnChanges, OnInit { // Dodaj OnInit
  
  @Input() userDoEdycji: User | null = null; 
  @Output() powrot = new EventEmitter<void>();
  
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  // Funkcja-tłumacz
  private mapujRoleNaLiczbe(rola: string): number {
    if (rola.toLowerCase().includes('admin')) {
      return 0; // Zakładając, że 0 = Admin
    }
    if (rola.toLowerCase().includes('pracownik')) {
      return 1; // Zakładając, że 1 = Pracownik
    }
    if (rola.toLowerCase().includes('podmiot')) {
      return 2; // Zakładając, że 2 = Podmiot
    }
    return 1; // Domyślna rola, jakby co
  }

  // 👇 NOWOŚĆ: Sygnał do przechowywania listy firm
  listaPodmiotow = signal<Podmiot[]>([]);

  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    rola: ['Pracownik UKNF', Validators.required], 
    password: [''], 
    podmiotId: [null as number | null] // 👇 NOWOŚĆ: Pole na ID firmy
  });

  // 👇 NOWOŚĆ: Pobieramy listę firm przy starcie formularza
  ngOnInit(): void {
    this.adminService.getPodmioty().subscribe({
      next: (data) => this.listaPodmiotow.set(data),
      error: (err) => console.error('Nie udało się pobrać listy podmiotów', err)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.userDoEdycji) {
      // ... (bez zmian)
      this.form.patchValue({
        username: this.userDoEdycji.username,
        email: this.userDoEdycji.email,
        rola: this.userDoEdycji.role 
      });
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    } else {
      // ... (bez zmian)
      this.form.get('password')?.setValidators(Validators.required);
      this.form.get('password')?.updateValueAndValidity();
      this.form.reset({rola: 'Pracownik UKNF', podmiotId: null});
    }
  }

zapisz() {
  if (this.form.invalid) return;

  if (this.form.value.rola === 'Podmiot' && !this.form.value.podmiotId) {
    alert('Dla roli "Podmiot" musisz wybrać firmę z listy!');
    return;
  }

  // --- Poprawka Tłumaczenia (Naprawia błąd "number is not assignable") ---
  // Tworzymy nowy, czysty obiekt zamiast kopiować stary
  const daneDoWysylki = {
    username: this.form.value.username,
    email: this.form.value.email,
    password: this.form.value.password,
    
    // 1. Tłumaczymy ROLĘ na liczbę
    rola: this.mapujRoleNaLiczbe(this.form.value.rola!),

    // 2. Zabezpieczamy PODMIOTID (konwersja na liczbę)
    podmiotId: this.form.value.podmiotId ? parseInt(this.form.value.podmiotId.toString(), 10) : null
  };
  // ---------------------------
  
  // Tryb edycji
  // --- POPRAWKA LITERÓWKI (Naprawia błąd 'userDoWysylki') ---
  if (this.userDoEdycji) { 
    
    this.adminService.updateUser(this.userDoEdycji.id, daneDoWysylki).subscribe({
      next: () => {
        alert('Zaktualizowano użytkownika!');
        this.powrot.emit();
      },
      error: (err) => alert('Błąd aktualizacji: ' + err.message)
    });
  } 
  // Tryb dodawania
  else {
    console.log('Wysyłam do API (po tłumaczeniu):', daneDoWysylki);
    
    this.adminService.createUser(daneDoWysylki).subscribe({
      next: () => {
        alert('Użytkownik dodany!');
        this.powrot.emit();
      },
      error: (err) => alert('Błąd dodawania: ' + err.message) // Tu był błąd 400
    });
  }
}

  anuluj() {
    this.powrot.emit();
  }
}
// (Ostatnia klamra } zamykająca klasę powinna być poniżej tej linii)