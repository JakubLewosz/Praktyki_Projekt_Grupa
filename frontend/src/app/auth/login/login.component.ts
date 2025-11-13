import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Potrzebujemy FormsModule dla [(ngModel)]

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // Dodajemy FormsModule
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Ten komponent da znać "w górę", gdy logowanie się uda
  @Output() udaneLogowanie = new EventEmitter<{ rola: 'admin' | 'uzytkownik' }>();

  // Dane formularza
  loginData = signal({
    email: '',
    password: ''
  });

  // Funkcja, którą podepnie Osoba 3 (API/Stan)
  zaloguj() {
    console.log("UI (Login): Kliknięto Zaloguj", this.loginData());
    
    // === TYMCZASOWA SYMULACJA ===
    // Udajemy, że backend sprawdził login i hasło.
    // Jeśli email zawiera "admin", zaloguj jako admin.
    
    if (this.loginData().email.includes('admin')) {
      console.log("UI (Login): Symuluję logowanie jako ADMIN");
      this.udaneLogowanie.emit({ rola: 'admin' });
    } else {
      console.log("UI (Login): Symuluję logowanie jako ZWYKŁY UŻYTKOWNIK");
      this.udaneLogowanie.emit({ rola: 'uzytkownik' });
    }
  }
}