using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class EditPodmiotDto
    {
        [Required]
        public string Nazwa { get; set; } = string.Empty;
    }
}