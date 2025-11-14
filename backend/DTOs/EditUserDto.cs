using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class EditUserDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public RolaUzytkownika Rola { get; set; }

        // Opcjonalne: ID Podmiotu, jeśli rola to Podmiot
        public int? PodmiotId { get; set; }
    }
}