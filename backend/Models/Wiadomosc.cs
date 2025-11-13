using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Wiadomosc
    {
        public int Id { get; set; }

        [Required]
        public string Tresc { get; set; } = string.Empty;
        
        public DateTime DataWyslania { get; set; } = DateTime.Now;

        // Kto jest autorem wiadomości
        [Required]
        public string AutorId { get; set; } = string.Empty;
        public virtual ApplicationUser Autor { get; set; } = null!;

        // Do jakiego wątku należy ta wiadomość
        public int WatekId { get; set; }
        public virtual Watek Watek { get; set; } = null!;

        // Wiadomość może mieć wiele załączników
        public virtual ICollection<Zalacznik> Zalaczniki { get; set; } = new List<Zalacznik>();
    }
}