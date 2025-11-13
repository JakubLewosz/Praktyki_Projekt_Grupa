using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CreatePodmiotRequestDto
    {
        [Required]
        public string Nazwa { get; set; } = string.Empty;
    }
}