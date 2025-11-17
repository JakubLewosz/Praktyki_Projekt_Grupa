import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from './core/services/auth'; // Popraw ścieżkę, jeśli trzeba

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
   * Komputowany sygnał sprawdzający status blokady
   */
  isBlocked = computed(() => {
    const user = this.currentUser();
    
    // ---
    // --- POCZĄTEK BLOKU DIAGNOSTYCZNEGO ---
    // ---
    console.log("===================================");
    console.log("AUTH DEBUG: Sprawdzam status...");
    
    if (user) {
      console.log("AUTH DEBUG: Znalazłem użytkownika w tokenie:", user);
      
      // Sprawdzamy, czy pole 'isActive' w ogóle istnieje
      if (user.hasOwnProperty('isActive')) {
        console.log("AUTH DEBUG: Pole 'isActive' istnieje.");
        console.log("AUTH DEBUG: Wartość 'isActive':", user.isActive);
        console.log("AUTH DEBUG: Typ wartości (typeof):", typeof user.isActive);

        // Sprawdzamy różne przypadki
        if (user.isActive === false) {
          console.log("AUTH DEBUG: WYNIK: Zablokowany (boolean false)");
        } 
        
        // ---
        // --- POPRAWKA JEST TUTAJ ---
        // ---
        // Mówimy TypeScriptowi, żeby na chwilę zignorował typy
        else if ((user.isActive as any) === "false") { 
          console.log("AUTH DEBUG: WYNIK: BŁĄD! Jest string 'false' zamiast boolean.");
        } 
        // ---
        // --- KONIEC POPRAWKI ---
        // ---
        
        else {
          console.log("AUTH DEBUG: WYNIK: Odblokowany (wartość nie jest boolean false)");
        }

      } else {
        console.log("AUTH DEBUG: WYNIK: BŁĄD! Brak pola 'isActive' w tokenie!");
      }

    } else {
      console.log("AUTH DEBUG: WYNIK: Brak zalogowanego użytkownika (null).");
    }
    console.log("===================================");
    // ---
    // --- KONIEC BLOKU DIAGNOSTYCZNEGO ---
    // ---

    // Nasza oryginalna logika (jest poprawna, o ile dane są poprawne)
    return user && user.isActive === false; 
  });

  logout() {
    this.authService.logout();
  }
}