import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // <-- IMPORTUJEMY ROUTER
import { AuthService } from '../../core/services/auth'; // <-- ZACHOWUJEMY SERWIS

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // @Output() jest już niepotrzebny, usuwamy go
  // @Output() udaneLogowanie = new EventEmitter...

  loginData = signal({
    email: '',
    password: ''
  });
  // Użyjmy sygnału także dla ładowania
  isLoading = signal(false); 

  // Wstrzykujemy OBA: AuthService i Router
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  zaloguj() {
    if (this.isLoading()) return;
    this.isLoading.set(true);

    const credentials = {
      username: this.loginData().email, 
      password: this.loginData().password
    };

    this.auth.login(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        console.log("✅ Zalogowano pomyślnie!", response);
        
        if(response.token) {
            localStorage.setItem('token', response.token);
        }

        // === OSTATECZNA POPRAWKA: ZAMIAST EMITOWAĆ, NAWIGUJEMY ===
        
        if (response.role === 'AdminUKNF') { 
          console.log("UI (Login): Rola Admin, nawiguję do /admin");
          // Mówimy routerowi, aby zmienił stronę na /admin
          this.router.navigate(['/admin']);

        } else {
          console.log("UI (Login): Rola Użytkownika, nawiguję do /skrzynka");
          // Mówimy routerowi, aby zmienił stronę na /skrzynka
          this.router.navigate(['/skrzynka']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error("❌ Błąd logowania:", err);
        alert("Nieprawidłowy login lub hasło!");
      }
    });
  }
}