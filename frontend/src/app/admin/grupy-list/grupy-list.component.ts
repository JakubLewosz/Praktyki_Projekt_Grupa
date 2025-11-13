import { Component, signal, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-grupy-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grupy-list.component.html',
  styleUrl: './grupy-list.component.css'
})
export class GrupyListComponent implements OnInit {
  
  @Output() chceDodacNowy = new EventEmitter<void>();
  grupy = signal<any[]>([]);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.zaladujGrupy();
  }

  zaladujGrupy() {
    this.adminService.getGrupy().subscribe({
      next: (data: any[]) => {
        console.log("📦 GRUPY (Raw):", data);

        const naprawione = data.map(g => ({
          id: g.id || g.Id,
          nazwa: g.nazwa || g.Nazwa || g.name || g.Name || 'Bez nazwy',
          isActive: g.isDisabled !== undefined ? !g.isDisabled : true
        }));

        this.grupy.set(naprawione);
      },
      error: (err) => console.error("❌ Błąd:", err)
    });
  }

  dodajGrupe() { this.chceDodacNowy.emit(); }
  edytuj(id: any) { console.log("Edycja", id); }
  usun(id: any) { console.log("Usuwanie", id); }
}