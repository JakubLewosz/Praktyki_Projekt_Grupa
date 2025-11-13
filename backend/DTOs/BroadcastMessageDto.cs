using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class BroadcastMessageDto
    {
        [Required]
        public string Temat { get; set; } = string.Empty;

        [Required]
        public string Tresc { get; set; } = string.Empty;

        [Required]
        public int GrupaId { get; set; } // Do jakiej grupy wysyłamy (np. "Banki") 

        public List<int> ZalacznikIds { get; set; } = new List<int>();
    }
}