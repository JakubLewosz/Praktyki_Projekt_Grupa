import { Component, signal } from '@angular/core'; // <-- Dodajemy signal
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Importujemy oba GŁÓWNE panele
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { SkrzynkaPanelComponent } from './wiadomosci/skrzynka-panel/skrzynka-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    AdminPanelComponent,
    SkrzynkaPanelComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  // Sygnał do przełączania się między dwoma głównymi widokami
  // 'skrzynka' | 'admin'
  glownyWidok = signal<'skrzynka' | 'admin'>('skrzynka');

  pokazSkrzynke() {
    this.glownyWidok.set('skrzynka');
  }

  pokazAdmina() {
    this.glownyWidok.set('admin');
  }
}