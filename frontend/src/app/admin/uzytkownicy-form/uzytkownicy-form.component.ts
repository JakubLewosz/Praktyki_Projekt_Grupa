import { Component, Output, EventEmitter, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/user.model'; 

@Component({
  selector: 'app-uzytkownicy-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './uzytkownicy-form.component.html',
  styleUrl: './uzytkownicy-form.component.css'
})
export class UzytkownicyFormComponent implements OnChanges { 
  
  // KROK 1: Naprawiamy błąd - dodajemy @Input, żeby przyjmować dane
  @Input() userDoEdycji: User | null = null; 
  @Output() powrot = new EventEmitter<void>();
  
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  // Zmieniamy role na stringi, bo z bazy przychodzi "Admin", a nie 0
  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    rola: ['Pracownik UKNF', Validators.required], // Domyślna rola
    password: [''], // Hasło opcjonalne
    podmiotId: [null as number | null] // Pole na powiązanie z podmiotem
  });

  // KROK 2: Ta funkcja wypełni formularz, gdy dostanie dane z @Input
  ngOnChanges(changes: SimpleChanges): void {
    if (this.userDoEdycji) {
      console.log("📝 Otrzymano dane do edycji:", this.userDoEdycji);
      
      this.form.patchValue({
        username: this.userDoEdycji.username,
        email: this.userDoEdycji.email,
        rola: this.userDoEdycji.role 
      });

      // Przy edycji hasło nie jest wymagane
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    } else {
      // Jeśli dodajemy nowego, hasło jest wymagane
      this.form.get('password')?.setValidators(Validators.required);
      this.form.get('password')?.updateValueAndValidity();
      this.form.reset({rola: 'Pracownik UKNF', podmiotId: null}); // Reset
    }
  }

  // KROK 3: Logika zapisu rozróżnia Edycję od Dodawania
  zapisz() {
    if (this.form.invalid) return;

    if (this.userDoEdycji) {
      // --- TRYB EDYCJI (PUT) ---
      this.adminService.updateUser(this.userDoEdycji.id, this.form.value).subscribe({
        next: () => {
          alert('Zaktualizowano użytkownika!');
          this.powrot.emit(); // Wracamy do listy
        },
        error: (err) => alert('Błąd aktualizacji: ' + err.message)
      });
    } else {
      // --- TRYB DODAWANIA (POST) ---
      this.adminService.createUser(this.form.value).subscribe({
        next: () => {
          alert('Użytkownik dodany!');
          this.powrot.emit(); // Wracamy do listy
        },
        error: (err) => alert('Błąd dodawania: ' + err.message)
      });
    }
  }

  anuluj() {
    this.powrot.emit();
  }
}