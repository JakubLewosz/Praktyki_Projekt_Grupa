import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Podmiot } from '../../core/models/user.model';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-podmiot-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './podmiot-form.component.html',
  styleUrl: './podmiot-form.component.css'
})
export class PodmiotFormComponent implements OnInit {
  
  @Input() podmiotDoEdycji: Podmiot | null = null;
  @Output() powrot = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  
  isEditMode = false;
  
  form = this.fb.group({
    nazwa: ['', Validators.required],
    nip: ['', Validators.required],
    regon: ['', Validators.required]
  });

  ngOnInit() {
    if (this.podmiotDoEdycji) {
      this.isEditMode = true;
      this.form.patchValue(this.podmiotDoEdycji);
    }
  }

  zapisz() {
    if (this.form.invalid) {
      alert('Wszystkie pola są wymagane.');
      return;
    }

    // === POPRAWKA (Błędy 8 i 9) ===
    // Tworzymy "bezpieczny" obiekt, bo this.form.value może zawierać 'null',
    // a serwis oczekuje 'string'.
    const payload = {
      nazwa: this.form.value.nazwa!,
      nip: this.form.value.nip!,
      regon: this.form.value.regon!
    };

    if (this.isEditMode && this.podmiotDoEdycji) {
      // === EDYCJA ===
      this.adminService.updatePodmiot(this.podmiotDoEdycji.id, payload).subscribe({
        next: () => {
          alert('Podmiot zaktualizowany!');
          this.powrot.emit();
        },
        error: (err: any) => alert('Błąd aktualizacji: ' + err.message)
      });
    } else {
      // === TWORZENIE ===
      this.adminService.createPodmiot(payload).subscribe({
        next: () => {
          alert('Podmiot utworzony!');
          this.powrot.emit();
        },
        error: (err: any) => alert('Błąd tworzenia: ' + err.message)
      });
    }
  }

  anuluj() {
    this.powrot.emit();
  }
}