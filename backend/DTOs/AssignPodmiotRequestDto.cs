using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class AssignPodmiotRequestDto
    {
        [Required]
        public int PodmiotId { get; set; }
        [Required]
        public int GrupaId { get; set; }
    }
}