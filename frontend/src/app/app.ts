import { Component } from '@angular/core'; 
import { CommonModule } from '@angular/common';
// ZWRÓĆ UWAGĘ: RouterOutlet jest teraz importowany z '@angular/router'
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet // Tylko RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  // Ten komponent jest teraz "pusty". Nie ma logiki @if.
  // Całą logiką zajmie się router.
}