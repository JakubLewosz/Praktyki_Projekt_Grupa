import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
<<<<<<< HEAD
// Poprawiamy import z 'App' na 'AppComponent'
import { AppComponent } from './app/app'; 

// Poprawiamy start aplikacji, aby używała 'AppComponent'
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
=======
import { AppComponent } from './app/app';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
>>>>>>> 58522b42a267c379e15619ed019298ad97af582d
