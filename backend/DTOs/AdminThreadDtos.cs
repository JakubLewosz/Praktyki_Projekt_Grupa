using System;
using System.Collections.Generic;

namespace backend.DTOs
{
    // 1. Do listy wątków
    public class AdminThreadListDto
    {
        public int Id { get; set; }
        public string Temat { get; set; } = string.Empty;
        public string NazwaNadawcy { get; set; } = string.Empty; // Np. "Bank PKO" lub "Merytoryczny UKNF"
        public string NazwaGrupy { get; set; } = string.Empty;
        public DateTime DataOstatniejWiadomosci { get; set; }
        public bool CzyNieprzeczytany { get; set; } // true, jeśli ostatnia wiadomość jest od Podmiotu
    }

    // 2. Do szczegółów wątku
    public class AdminThreadDetailsDto
    {
        public int Id { get; set; }
        public string Temat { get; set; } = string.Empty;
        public string NazwaGrupy { get; set; } = string.Empty;
        public List<AdminMessageDto> Wiadomosci { get; set; } = new List<AdminMessageDto>();
    }

    public class AdminMessageDto
    {
        public int Id { get; set; }
        public string Tresc { get; set; } = string.Empty;
        public DateTime DataWyslania { get; set; }
        public string AutorNazwa { get; set; } = string.Empty; // "Admin", "Bank X", "Merytoryczny"
        public bool IsAdmin { get; set; } // Czy to wiadomość od nas (Admina/UKNF)?
        public List<AttachmentDto> Zalaczniki { get; set; } = new List<AttachmentDto>();
    }

    // 3. Do wysyłania odpowiedzi
    public class AdminReplyDto
    {
        public string Tresc { get; set; } = string.Empty;
    }
}