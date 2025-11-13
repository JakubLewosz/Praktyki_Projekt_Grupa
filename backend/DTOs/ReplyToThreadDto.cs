using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class ReplyToThreadDto
    {
        [Required]
        public string Tresc { get; set; } = string.Empty;

        // Lista ID załączników (tak jak poprzednio)
        public List<int> ZalacznikIds { get; set; } = new List<int>();
    }
}