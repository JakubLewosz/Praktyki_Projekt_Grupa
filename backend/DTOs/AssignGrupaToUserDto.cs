using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class AssignGrupaToUserDto
    {
        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public int GrupaId { get; set; }
    }
}