import { Component, signal, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-uzytkownicy-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './uzytkownicy-list.component.html',
  styleUrl: './uzytkownicy-list.component.css'
})
export class UzytkownicyListComponent implements OnInit {

  private adminService = inject(AdminService);
  
  // === NAZWY SĄ POPRAWNE (pasują do admin-panel) ===
  @Output() startEdycji = new EventEmitter<User>(); 
  @Output() dodajNowy = new EventEmitter<void>(); 

  uzytkownicy = signal<User[]>([]);

  ngOnInit() {
    this.pobierzUzytkownikow();
  }

  // === KROK 1: PRZYWRACAMY FUNKCJĘ TŁUMACZA ===
  // (Ona czyta 'rola' jako numer)
  private tlumaczRole(kod: number): string {
    switch (kod) {
      case 0: return 'Admin';
      case 1: return 'Pracownik UKNF';
      case 2: return 'Podmiot';
      default: return 'Nieznana (' + kod + ')';
    }
  }

  pobierzUzytkownikow() {
    // Odbieramy 'any[]', bo dane z serwera są "surowe"
    this.adminService.getUsers().subscribe({
      next: (data: any[]) => {
        console.log("📦 DANE SUROWE (z serwera):", data);

        // === KROK 2: PRZYWRACAMY POPRAWNY TŁUMACZ ===
        // (Ten, który czyta 'userName', 'rola', 'isDisabled' i 'podmiotId')
        const naprawieni = data.map(u => ({
          id: u.id,
          email: u.email,
          username: u.userName, // Czytamy 'userName' z API
          
          role: this.tlumaczRole(u.rola), // Czytamy 'rola' (liczba) z API
          
          isActive: !u.isDisabled, // Czytamy 'isDisabled' z API i odwracamy
  
          powiazanie: u.podmiotId ? `Podmiot ID: ${u.podmiotId}` : '-' // Czytamy 'podmiotId' z API
        }));

        console.log("✅ DANE NAPRAWIONE (dla widoku):", naprawieni);
        this.uzytkownicy.set(naprawieni);
      },
      error: (err: any) => console.error("❌ Błąd pobierania użytkowników:", err)
    });
  }

  // === KROK 3: FUNKCJE EMITUJĄ POPRAWNE EVENTY ===
  edytujUzytkownika(user: User) {
    console.log("✏️ Kliknięto edycję dla:", user.username);
    this.startEdycji.emit(user); // Wysyłamy 'startEdycji'
  }
  
  dodajNowegoUzytkownika() { 
    this.dodajNowy.emit(); // Wysyłamy 'dodajNowy'
  }

  // Logika zmiany statusu (jest już poprawna)
  zmienStatus(user: User) {
    if (user.isActive) {
      if (!confirm(`Czy na pewno chcesz zablokować użytkownika ${user.username}?`)) return;
      this.adminService.disableUser(user.id).subscribe({
        next: () => this.zaktualizujLokalnie(user.id, false),
        error: (err: any) => alert("Błąd: " + err.message)
      });
    } else {
      if (!confirm(`Czy na pewno chcesz odblokować użytkownika ${user.username}?`)) return;
      this.adminService.enableUser(user.id).subscribe({
        next: () => this.zaktualizujLokalnie(user.id, true),
        error: (err: any) => alert("Błąd: " + err.message)
      });
    }
  }

  private zaktualizujLokalnie(id: string, czyAktywny: boolean) {
    this.uzytkownicy.update(lista => 
      lista.map(u => u.id === id ? { ...u, isActive: czyAktywny } : u)
    );
  }
}