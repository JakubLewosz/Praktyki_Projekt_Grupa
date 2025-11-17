using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class EditPodmiotDto
    {
        [Required]
        public string Nazwa { get; set; } = string.Empty;
        
        // NOWE POLA
        public string NIP { get; set; } = string.Empty;
        public string REGON { get; set; } = string.Empty;
    }
}