using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Watek
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(256)]
        public string Temat { get; set; } = string.Empty;

        // Kluczowe dla bezpieczeństwa: Każdy wątek jest przypisany do Grupy
        public int GrupaId { get; set; }
        public virtual Grupa Grupa { get; set; } = null!;

        // Wątek zawiera kolekcję wiadomości
        public virtual ICollection<Wiadomosc> Wiadomosci { get; set; } = new List<Wiadomosc>();
    }
}