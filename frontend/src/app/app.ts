import { Component, signal } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Importujemy wszystkie 3 główne "widoki"
import { LoginComponent } from './auth/login/login.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { SkrzynkaPanelComponent } from './wiadomosci/skrzynka-panel/skrzynka-panel.component';

// Definiujemy stany naszej aplikacji
type Rola = 'admin' | 'uzytkownik' | null;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    LoginComponent,       // <-- Importujemy
    AdminPanelComponent,
    SkrzynkaPanelComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  
  // Sygnał, który śledzi, czy ktoś jest zalogowany i jaką ma rolę
  zalogowanaRola = signal<Rola>(null);

  // Funkcja, którą wywoła komponent logowania po sukcesie
  handleUdaneLogowanie(event: { rola: 'admin' | 'uzytkownik' }) {
    console.log("APP (ROOT): Odebrano zdarzenie logowania, ustawiam rolę na:", event.rola);
    this.zalogowanaRola.set(event.rola);
  }

  // Funkcja do wylogowania (będzie można ją podpiąć do przycisku w headerze)
  wyloguj() {
    this.zalogowanaRola.set(null);
  }
}