import { Component, Output, EventEmitter, inject, signal } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
// Ta ścieżka jest prawdopodobnie poprawna, błąd wynika z braku restartu serwera
import { SkrzynkaService } from '../../core/services/skrzynka.service'; 

@Component({
  selector: 'app-nowa-wiadomosc-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nowa-wiadomosc-form.component.html',
  styleUrl: './nowa-wiadomosc-form.component.css'
})
export class NowaWiadomoscFormComponent {

  @Output() powrot = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private skrzynkaService = inject(SkrzynkaService); 

  isSending = signal(false);

  form = this.fb.group({
    temat: ['', Validators.required],
    tresc: ['', Validators.required]
  });

  wyslijWiadomosc() {
    if (this.form.invalid) {
      alert('Oba pola (Temat i Treść) są wymagane.');
      return;
    }

    this.isSending.set(true);
    
    const payload = {
      temat: this.form.value.temat!,
      tresc: this.form.value.tresc!
    };

    this.skrzynkaService.wyslijNowaWiadomosc(payload).subscribe({
      next: () => {
        alert('Wiadomość została wysłana (symulacja).');
        this.isSending.set(false); 
        this.powrot.emit(); 
      },
      // POPRAWKA BŁĘDU (dodajemy typ 'any' dla 'err')
      error: (err: any) => {
        console.error('Błąd wysyłania wiadomości:', err);
        alert('Wystąpił błąd podczas wysyłania wiadomości.');
        this.isSending.set(false); 
      }
    });
  }

  anuluj() {
    if (this.isSending()) return;
    this.powrot.emit();
  }
}