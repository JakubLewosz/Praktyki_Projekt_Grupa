import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component'; // <-- POPRAW ŚCIEŻKĘ do pliku kolegi!

// Tutaj pewnie masz jakiś komponent "Główny" od kolegi (np. Dashboard czy Panel)
// Załóżmy, że nazywa się DashboardComponent - jeśli go nie masz, zakomentuj tę linię.
// import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
    // 1. Pusta ścieżka -> Idź do logowania
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    
    // 2. Ścieżka logowania -> Pokaż komponent Logowania
    { path: 'login', component: LoginComponent },

    // 3. Ścieżka po zalogowaniu (Dashboard)
    // Na razie zróbmy tak, żeby nie było błędu, nawet jak nie masz Dashboardu:
    // { path: 'dashboard', component: DashboardComponent } 
];