using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Zalacznik
    {
        public int Id { get; set; }

        [Required]
        public string OryginalnaNazwa { get; set; } = string.Empty;

        // Będziemy przechowywać pliki na serwerze, np. "uploads/guid-nazwa.pdf"
        [Required]
        public string SciezkaPliku { get; set; } = string.Empty;
        
        [Required]
        public string TypMIME { get; set; } = string.Empty;

        public long Rozmiar { get; set; }

        // Jeden załącznik może być (teoretycznie) w wielu wiadomościach
        public virtual ICollection<Wiadomosc> Wiadomosci { get; set; } = new List<Wiadomosc>();
    }
}