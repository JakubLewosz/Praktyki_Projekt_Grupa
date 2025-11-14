import { Component, Output, EventEmitter, inject, Input, OnChanges, SimpleChanges, OnInit, signal } from '@angular/core';
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
export class UzytkownicyFormComponent implements OnChanges, OnInit { 
  
  @Input() userDoEdycji: User | null = null; 
  @Output() powrot = new EventEmitter<void>();
  
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  // Funkcja-tłumacz
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

  listaPodmiotow = signal<Podmiot[]>([]);

  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    rola: ['Pracownik UKNF', Validators.required], 
    password: ['', [Validators.required, Validators.minLength(6)]], 
    podmiotId: [null as number | null]
  });

  ngOnInit(): void {
    this.adminService.getPodmioty().subscribe({
      next: (data) => this.listaPodmiotow.set(data),
      error: (err) => console.error('Nie udało się pobrać listy podmiotów', err)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.userDoEdycji) {
      // Tryb "Edycja"
      this.form.patchValue({
        username: this.userDoEdycji.username,
        email: this.userDoEdycji.email,
        rola: this.userDoEdycji.role 
      });
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    } else {
      // Tryb "Dodaj Nowy"
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
      
      this.form.reset({
        username: '',
        email: '',
        rola: 'Pracownik UKNF', 
        password: '',
        podmiotId: null
      });
    }
  }

  zapisz() {
    if (this.form.invalid && this.form.touched) {
      alert('Formularz jest niepoprawny. Sprawdź pole hasła (min. 6 znaków).');
      return;
    }

    const formValue = this.form.value;
    const rolaLiczbowa = this.mapujRoleNaLiczbe(formValue.rola!);
    let podmiotIdDoWysylki: number | null = null;

    if (rolaLiczbowa === 2) { // 2 = Podmiot
      if (!formValue.podmiotId) {
        alert('Dla roli "Podmiot" musisz wybrać firmę z listy!');
        return; 
      }
      podmiotIdDoWysylki = parseInt(formValue.podmiotId.toString(), 10);
    } 
    
    const daneDoWysylki = {
      username: formValue.username,
      email: formValue.email,
      password: formValue.password,
      rola: rolaLiczbowa,
      podmiotId: podmiotIdDoWysylki 
    };
    
    // Tryb edycji
    if (this.userDoEdycji) { 
      this.adminService.updateUser(this.userDoEdycji.id, daneDoWysylki).subscribe({
        next: () => {
          alert('Zaktualizowano użytkownika!');
          this.powrot.emit();
        },
        // === POPRAWKA TUTAJ (brakujący +) ===
        error: (err) => alert('Błąd aktualizacji: ' + (err.message || 'Błąd serwera'))
      });
    } 
    // Tryb dodawania
    else {
      console.log('Wysyłam do API (po tłumaczeniu):', JSON.stringify(daneDoWysylki, null, 2));
      
      this.adminService.createUser(daneDoWysylki).subscribe({
        next: () => {
          alert('Użytkownik dodany!');
          this.powrot.emit();
        },
        // === POPRAWKA TUTAJ (brakujący +) ===
        error: (err) => alert('Błąd dodawania: ' + (err.message || 'Sprawdź, czy hasło jest wystarczająco silne.')) 
      });
    }
  }

  anuluj() {
    this.powrot.emit();
  }
}