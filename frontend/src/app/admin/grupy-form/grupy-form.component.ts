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

  form = this.fb.group({
    nazwa: ['', Validators.required]
  });

  zapisz() {
    if (this.form.invalid) return;

    // === POPRAWKA (Błąd 7) ===
    // Serwis oczekuje 'string', a nie obiekt { nazwa: '...' }
    const nazwaGrupy = this.form.value.nazwa!; 

    this.adminService.createGrupa(nazwaGrupy).subscribe({
      next: () => {
        alert('Nowa grupa została utworzona!');
        this.powrot.emit();
      },
      error: (err: any) => {
        console.error("Błąd tworzenia grupy:", err);
        alert("Wystąpił błąd: " + err.message);
      }
    });
  }

  anuluj() {
    this.powrot.emit();
  }
}