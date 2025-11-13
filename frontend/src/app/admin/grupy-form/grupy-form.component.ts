import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-grupa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './grupy-form.component.html',
  styleUrl: './grupy-form.component.css'
})
export class GrupaFormComponent {
  
  @Output() powrot = new EventEmitter<void>();
  
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  // Formularz: Tylko nazwa jest wymagana
  form = this.fb.group({
    nazwa: ['', [Validators.required, Validators.minLength(3)]]
  });

  zapisz() {
    if (this.form.invalid) return;

    this.adminService.createGrupa(this.form.value).subscribe({
      next: () => {
        alert('Grupa została utworzona!');
        this.powrot.emit();
      },
      error: (err) => {
        console.error('❌ Błąd:', err);
        alert('Nie udało się utworzyć grupy.');
      }
    });
  }

  anuluj() {
    this.powrot.emit();
  }
}