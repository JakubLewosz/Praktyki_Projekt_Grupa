using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Nasze stare tabele
        public DbSet<Podmiot> Podmioty { get; set; }
        public DbSet<Grupa> Grupy { get; set; }

        // NOWE TABELE
        public DbSet<Watek> Watki { get; set; }
        public DbSet<Wiadomosc> Wiadomosci { get; set; }
        public DbSet<Zalacznik> Zalaczniki { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Stare relacje
            builder.Entity<Podmiot>()
                .HasMany(p => p.Grupy)
                .WithMany(g => g.Podmioty)
                .UsingEntity(j => j.ToTable("GrupaPodmiot"));

            builder.Entity<ApplicationUser>()
                .HasMany(u => u.Grupy)
                .WithMany(g => g.UzytkownicyMerytoryczni)
                .UsingEntity(j => j.ToTable("UzytkownikMerytorycznyGrupa"));

            // --- NOWE RELACJE ---

            // Relacja Wiadomość -> Autor (Jeden autor ma wiele wiadomości)
            builder.Entity<Wiadomosc>()
                .HasOne(w => w.Autor)
                .WithMany()
                .HasForeignKey(w => w.AutorId);

            // Relacja Wiadomość -> Wątek (Jeden wątek ma wiele wiadomości)
            builder.Entity<Wiadomosc>()
                .HasOne(w => w.Watek)
                .WithMany(w => w.Wiadomosci)
                .HasForeignKey(w => w.WatekId);
            
            // Relacja Wątek -> Grupa (Jedna grupa ma wiele wątków)
            builder.Entity<Watek>()
                .HasOne(w => w.Grupa)
                .WithMany() // Grupa nie musi wiedzieć o wątkach
                .HasForeignKey(w => w.GrupaId);

            // Relacja Wiadomość <-> Załącznik (Wiele-do-Wielu)
            builder.Entity<Wiadomosc>()
                .HasMany(w => w.Zalaczniki)
                .WithMany(z => z.Wiadomosci)
                .UsingEntity(j => j.ToTable("WiadomoscZalacznik"));
        }
    }
}