import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

// Zaimportuj swój zaktualizowany AuthService
// Popraw ścieżkę, jeśli jest inna
import { AuthService } from './core/services/auth'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet 
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  
  private authService = inject(AuthService);
  private router = inject(Router);

  private currentUser = toSignal(this.authService.currentUser);

  /**
   * Ten "komputowany" sygnał będzie true TYLKO jeśli użytkownik
   * istnieje ORAZ jego status 'isActive' to false.
   */
  isBlocked = computed(() => {
    const user = this.currentUser();

    if (!user) {
      return false; // Nie jest zalogowany, więc nie jest zablokowany
    }

    // ---
    // --- SZYBKA POPRAWKA (FRONTEND) ---
    // ---
    // Sprawdzamy oba przypadki:
    // 1. Czy 'isActive' to boolean 'false'?
    // 2. Czy 'isActive' to string "false"?
    if (user.isActive === false || user.isActive === "false") {
      return true; // Tak, jest zablokowany
    }
    // ---
    // --- KONIEC POPRAWKI ---
    // ---

    // W każdym innym przypadku (np. true, "true", null) jest odblokowany
    return false; 
  });

  /**
   * Metoda, którą wywoła przycisk "Wyloguj" na ekranie blokady
   */
  logout() {
    this.authService.logout();
  }
}