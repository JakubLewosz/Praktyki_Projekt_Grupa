using System.Collections.Generic;

namespace backend.Models
{
    public class Grupa
    {
        public int Id { get; set; }
        public string Nazwa { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        // Właściwość nawigacyjna
        public virtual ICollection<Podmiot> Podmioty { get; set; } = new List<Podmiot>();

        // Właściwość nawigacyjna
        public virtual ICollection<ApplicationUser> UzytkownicyMerytoryczni { get; set; } = new List<ApplicationUser>();
    }
}