import { Component, Output, EventEmitter, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SkrzynkaService } from '../../core/services/skrzynka.service';
import { Grupa } from '../../core/models/user.model'; // Importujemy model

@Component({
  selector: 'app-nowa-wiadomosc-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nowa-wiadomosc-form.component.html',
  styleUrl: './nowa-wiadomosc-form.component.css'
})
export class NowaWiadomoscFormComponent {

  @Output() powrot = new EventEmitter<void>();
  
  // Odbieramy listę grup od rodzica
  @Input() mojeGrupy: Grupa[] = [];

  private fb = inject(FormBuilder);
  private skrzynkaService = inject(SkrzynkaService); 

  isSending = signal(false);

  form = this.fb.group({
    // Dodajemy pole 'grupaId'
    grupaId: [null as number | null, Validators.required], 
    temat: ['', Validators.required],
    tresc: ['', Validators.required]
  });

  wyslijWiadomosc() {
    if (this.form.invalid) {
      alert('Wszystkie pola (Grupa, Temat i Treść) są wymagane.');
      return;
    }

    this.isSending.set(true);
    
    // Przygotowujemy payload zgodny z DTO backendowca
    const payload = {
      temat: this.form.value.temat!,
      tresc: this.form.value.tresc!,
      grupaId: this.form.value.grupaId!, // Dodajemy grupaId
      zalacznikIds: [] // Dodajemy pustą tablicę
    };

    this.skrzynkaService.wyslijNowaWiadomosc(payload).subscribe({
      next: () => {
        // Teraz to prawdziwy sukces z API
        alert('Wiadomość została wysłana.');
        this.isSending.set(false); 
        this.powrot.emit(); 
      },
      error: (err: any) => {
        console.error('Błąd wysyłania wiadomości:', err);
        alert('Wystąpił błąd podczas wysyłania wiadomości: ' + err.message);
        this.isSending.set(false); 
      }
    });
  }

  anuluj() {
    if (this.isSending()) return;
    this.powrot.emit();
  }
}