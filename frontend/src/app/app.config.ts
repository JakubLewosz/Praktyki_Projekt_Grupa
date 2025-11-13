import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// DODAJ TE IMPORTY:
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    // ZMODYFIKUJ TĘ LINIJKĘ:
    provideHttpClient(withInterceptors([authInterceptor])) 
  ]
};