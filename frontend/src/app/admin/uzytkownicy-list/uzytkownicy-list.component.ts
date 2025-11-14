import { Component, signal, Output, EventEmitter, OnInit } from '@angular/core';
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


  // Dodaj na górze klasy
  @Output() chceEdytowac = new EventEmitter<User>();

  // Podmień funkcję edytujUzytkownika
  edytujUzytkownika(user: User) {
    console.log("✏️ Kliknięto edycję dla:", user.username);
    this.chceEdytowac.emit(user); // Wysyłamy usera do rodzica (Admin Panel)
  }
  
  @Output() chceDodacNowy = new EventEmitter<void>();
  uzytkownicy = signal<User[]>([]);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.pobierzUzytkownikow();
  }

  // Funkcja pomocnicza: Zamienia cyfrę na tekst
  private tlumaczRole(kod: number): string {
    // Zgaduję enumy na podstawie standardów (0 to zazwyczaj Admin)
    switch (kod) {
      case 0: return 'Admin';
      case 1: return 'Pracownik UKNF';
      case 2: return 'Podmiot';
      default: return 'Nieznana (' + kod + ')';
    }
  }

  pobierzUzytkownikow() {
    this.adminService.getUsers().subscribe({
      next: (data: any[]) => {
        console.log("📦 DANE SUROWE:", data);

        const naprawieni = data.map(u => ({
          id: u.id,
          email: u.email,
          username: u.userName, // API: userName -> Model: username
          
          // TŁUMACZENIE ROLI: Liczba -> Tekst
          role: this.tlumaczRole(u.rola), 
          
          // TŁUMACZENIE STATUSU: isDisabled -> isActive (negacja!)
          isActive: !u.isDisabled, 

          // Obsługa powiązania (jeśli null, wstaw kreskę)
          powiazanie: u.podmiotId ? `Podmiot ID: ${u.podmiotId}` : '-' 
        }));

        console.log("✅ DANE PRZETŁUMACZONE:", naprawieni);
        this.uzytkownicy.set(naprawieni);
      },
      error: (err) => console.error("❌ Błąd:", err)
    });
  }

  dodajNowegoUzytkownika() { this.chceDodacNowy.emit(); }
  // edytujUzytkownika(id: any) { console.log('Edycja', id); }
  wylaczUzytkownika(id: any) { console.log('Zmiana statusu', id); }

  // uzytkownicy-list.component.ts

// Zmień argument na cały obiekt 'user', żebyśmy znali jego aktualny status
zmienStatus(user: User) {
  if (user.isActive) {
    // Jeśli jest aktywny -> BLOKUJEMY
    if (!confirm(`Czy na pewno chcesz zablokować użytkownika ${user.username}?`)) return;

    this.adminService.disableUser(user.id).subscribe({
      next: () => {
        // Aktualizujemy lokalnie (zmieniamy flagę na false)
        this.zaktualizujLokalnie(user.id, false);
        console.log(`⛔ Zablokowano użytkownika ${user.id}`);
      },
      error: (err) => alert("Nie udało się zablokować użytkownika.")
    });

  } else {
    // Jeśli jest zablokowany -> AKTYWUJEMY
    this.adminService.enableUser(user.id).subscribe({
      next: () => {
        // Aktualizujemy lokalnie (zmieniamy flagę na true)
        this.zaktualizujLokalnie(user.id, true);
        console.log(`✅ Odblokowano użytkownika ${user.id}`);
      },
      error: (err) => alert("Nie udało się odblokować użytkownika.")
    });
  }
}

// Pomocnicza funkcja, żeby nie odświeżać całej listy z API
private zaktualizujLokalnie(id: string, czyAktywny: boolean) {
  this.uzytkownicy.update(lista => 
    lista.map(u => u.id === id ? { ...u, isActive: czyAktywny } : u)
  );
}
}
