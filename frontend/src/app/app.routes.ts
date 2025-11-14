import { Routes } from '@angular/router';

// Importujemy komponenty, które będą naszymi "stronami"
import { LoginComponent } from './auth/login/login.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { SkrzynkaPanelComponent } from './wiadomosci/skrzynka-panel/skrzynka-panel.component';

// W przyszłości Osoba 3 (API) doda tu "AuthGuard"
// import { authGuard } from './core/auth.guard'; 

export const routes: Routes = [
  // 1. Ścieżka logowania
  { path: 'login', component: LoginComponent },

  // 2. Ścieżka Admina (w przyszłości chroniona)
  { 
    path: 'admin', 
    component: AdminPanelComponent
    // canActivate: [authGuard], // Doda to Osoba 3
    // data: { rola: 'admin' }  // Doda to Osoba 3
  },

  // 3. Ścieżka Skrzynki (w przyszłości chroniona)
  { 
    path: 'skrzynka', 
    component: SkrzynkaPanelComponent
    // canActivate: [authGuard], // Doda to Osoba 3
    // data: { rola: 'uzytkownik' } // Doda to Osoba 3
  },

  // 4. Pusta ścieżka -> przekieruj na logowanie
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 5. Jakikolwiek inny adres -> przekieruj na logowanie
  { path: '**', redirectTo: 'login' } 
];