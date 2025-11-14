using System.Collections.Generic;

namespace backend.Models
{
    public class Podmiot
    {
        public int Id { get; set; }
        public string Nazwa { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        // NOWE POLA
        public string NIP { get; set; } = string.Empty;
        public string REGON { get; set; } = string.Empty;

        // Właściwość nawigacyjna
        public virtual ICollection<Grupa> Grupy { get; set; } = new List<Grupa>();
    }
}