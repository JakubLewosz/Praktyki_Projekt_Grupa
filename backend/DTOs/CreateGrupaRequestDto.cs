using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CreateGrupaRequestDto
    {
        [Required]
        public string Nazwa { get; set; } = string.Empty;
    }
}