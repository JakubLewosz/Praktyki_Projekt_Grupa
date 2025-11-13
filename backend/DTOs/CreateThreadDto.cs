using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CreateThreadDto
    {
        [Required]
        public string Temat { get; set; } = string.Empty;

        [Required]
        public string Tresc { get; set; } = string.Empty;

        [Required]
        public int GrupaId { get; set; } // Do jakiej grupy należy wątek

        // Używane tylko przez Podmiot, aby określić, że pisze do UKNF.
        // Lub przez UKNF, aby określić, do kogo pisze.
        public int? PodmiotId { get; set; }

        // Lista ID załączników, które dostaliśmy z /api/attachments/upload
        public List<int> ZalacznikIds { get; set; } = new List<int>();
    }
}