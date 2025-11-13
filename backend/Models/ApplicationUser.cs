using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace backend.Models
{
    // Definiujemy enum dla ról, aby uniknąć literówek w kodzie
    public enum RolaUzytkownika
    {
        AdminUKNF,
        MerytorycznyUKNF,
        Podmiot
    }

    public class ApplicationUser : IdentityUser
    {
        // Nasze dodatkowe pole do określania roli
        public RolaUzytkownika Rola { get; set; }

        // Klucz obcy (Foreign Key) do tabeli Podmiot.
        public int? PodmiotId { get; set; }

        // Właściwość nawigacyjna do powiązanego podmiotu
        public virtual Podmiot? Podmiot { get; set; }

        // Właściwość nawigacyjna dla użytkowników merytorycznych
        public virtual ICollection<Grupa> Grupy { get; set; } = new List<Grupa>();
    }
}