using System;
using System.Collections.Generic;

namespace backend.DTOs
{
    public class MessageDto
    {
        public int Id { get; set; }
        public string Tresc { get; set; } = string.Empty;
        public DateTime DataWyslania { get; set; }
        public AuthorDto Autor { get; set; } = null!;
        
        // --- NOWE POLE ---
        // True, jeśli wiadomość pochodzi od pracownika UKNF (Admina lub Merytorycznego)
        public bool IsAdmin { get; set; } 
        // -----------------

        public List<AttachmentDto> Zalaczniki { get; set; } = new List<AttachmentDto>();
    }
}