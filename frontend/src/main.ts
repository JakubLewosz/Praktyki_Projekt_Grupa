import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
// Poprawiamy import z 'App' na 'AppComponent'
import { AppComponent } from './app/app'; 

// Poprawiamy start aplikacji, aby używała 'AppComponent'
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));