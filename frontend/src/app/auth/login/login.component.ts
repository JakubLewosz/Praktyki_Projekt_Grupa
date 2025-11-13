import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Usunęliśmy Router, bo nie jest potrzebny
import { AuthService } from '../../core/services/auth'; // <-- Upewnij się co do ścieżki!

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Ten @Output jest kluczowy dla AppComponent
  @Output() udaneLogowanie = new EventEmitter<{ rola: 'admin' | 'uzytkownik' }>();

  loginData = signal({
    email: '',
    password: ''
  });
  isLoading = false;

  // Wstrzykujemy tylko AuthService
  constructor(private auth: AuthService) {}

  zaloguj() {
    if (this.isLoading) return;
    this.isLoading = true;

    const credentials = {
      username: this.loginData().email, 
      password: this.loginData().password
    };

    this.auth.login(credentials).subscribe({
      next: (response) => {
        console.log("✅ Zalogowano pomyślnie!", response);
        
        // Zapisujemy token (tak jak wcześniej)
        if(response.token) {
            localStorage.setItem('token', response.token);
        }

        // === ZMIANA: ZAMIAST ROUTERA, EMITUJEMY ZDARZENIE ===
        // Musimy zmapować rolę z backendu (np. "AdminUKNF") 
        // na rolę, której oczekuje UI ("admin" lub "uzytkownik")
        
        let rolaUI: 'admin' | 'uzytkownik';

        // Na podstawie logu z konsoli: { ... role: 'AdminUKNF' }
        if (response.role === 'AdminUKNF') { 
          rolaUI = 'admin';
        } else {
          // Zakładamy, że każda inna rola to 'uzytkownik'
          rolaUI = 'uzytkownik'; 
        }

        // Wysyłamy zdarzenie "w górę" do app.component
        this.udaneLogowanie.emit({ rola: rolaUI });
      },
      error: (err) => {
        console.error("❌ Błąd logowania:", err);
        alert("Nieprawidłowy login lub hasło!");
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}