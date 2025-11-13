import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth'; 
import { MessageService } from './core/services/message'; // lub message.service

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Teraz to nie będzie błędem, bo używamy tego niżej
  template: `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Test API</h1>
      <p>Status: Sprawdzanie w konsoli (F12)...</p>
      
      <router-outlet></router-outlet> 
    </div>
  `
})
export class AppComponent implements OnInit {
  
  constructor(private auth: AuthService, private msg: MessageService) {}

  ngOnInit() {
    console.log('🚀 Rozpoczynam test API...');
    const testUser = { 
      username: 'admin@uknf.pl', 
      password: 'SuperHaslo123!' 
    };

    this.auth.login(testUser).subscribe({
      next: (res) => {
        console.log('✅ Zalogowano!', res);
        this.msg.getThreads().subscribe({
          next: (threads) => console.log('✅ Wątki:', threads),
          error: (err) => console.error('❌ Błąd wątków:', err)
        });
      },
      error: (err) => console.error('❌ Błąd logowania:', err)
    });
  }
}