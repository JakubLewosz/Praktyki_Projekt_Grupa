using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
    // Upewnij się, że ta linia poprawnie dziedziczy po IdentityDbContext
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        // Konstruktor, który powodował błąd
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Rejestracja tabel
        public DbSet<Podmiot> Podmioty { get; set; }
        public DbSet<Grupa> Grupy { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            // WAŻNE: To musi być wywołane jako pierwsze
            base.OnModelCreating(builder);

            // Relacja Podmiot <-> Grupa
            builder.Entity<Podmiot>()
                .HasMany(p => p.Grupy)
                .WithMany(g => g.Podmioty)
                .UsingEntity(j => j.ToTable("GrupaPodmiot"));

            // Relacja ApplicationUser (Merytoryczny) <-> Grupa
            builder.Entity<ApplicationUser>()
                .HasMany(u => u.Grupy)
                .WithMany(g => g.UzytkownicyMerytoryczni)
                .UsingEntity(j => j.ToTable("UzytkownikMerytorycznyGrupa"));
        }
    }
}