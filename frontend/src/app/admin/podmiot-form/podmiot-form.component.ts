import { Component, Output, EventEmitter, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-podmiot-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './podmiot-form.component.html',
  styleUrl: './podmiot-form.component.css'
})
export class PodmiotFormComponent implements OnChanges {
  
  @Input() podmiotDoEdycji: any = null; // 👈 Tutaj wpadną dane
  @Output() powrot = new EventEmitter<void>();
  
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  form = this.fb.group({
    nazwa: ['', Validators.required],
    nip: ['', [Validators.required, Validators.minLength(10)]],
    regon: ['']
  });

  // 👇 Magia: Jak przyjdą dane, wypełnij formularz
  ngOnChanges(changes: SimpleChanges): void {
    if (this.podmiotDoEdycji) {
      console.log("📝 Edytuję:", this.podmiotDoEdycji);
      this.form.patchValue({
        nazwa: this.podmiotDoEdycji.nazwa,
        nip: this.podmiotDoEdycji.nip,
        regon: this.podmiotDoEdycji.regon
      });
    } else {
      this.form.reset(); // Jak nowy, to czyścimy
    }
  }

  zapisz() {
    if (this.form.invalid) return;

    if (this.podmiotDoEdycji) {
      // --- TRYB EDYCJI (UPDATE) ---
      console.log("Wysyłam UPDATE dla ID:", this.podmiotDoEdycji.id);
      
      this.adminService.updatePodmiot(this.podmiotDoEdycji.id, this.form.value).subscribe({
        next: () => {
          alert('Zaktualizowano podmiot!');
          this.powrot.emit();
        },
        error: (err) => {
          console.error(err);
          // Tutaj zobaczysz swój błąd 404 - to oczekiwane!
          alert('Backend nie gotowy: Brak metody PUT /api/Admin/podmioty/' + this.podmiotDoEdycji.id);
        }
      });

    } else {
      // --- TRYB DODAWANIA (CREATE) ---
      this.adminService.createPodmiot(this.form.value).subscribe({
        next: () => {
          alert('Podmiot dodany!');
          this.powrot.emit();
        },
        error: (err) => alert('Błąd dodawania')
      });
    }
  }

  anuluj() {
    this.powrot.emit();
  }
}