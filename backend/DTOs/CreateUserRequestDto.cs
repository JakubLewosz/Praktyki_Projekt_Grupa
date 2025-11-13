using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CreateUserRequestDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        public RolaUzytkownika Rola { get; set; }

        // Opcjonalne: ID Podmiotu, jeśli tworzymy użytkownika typu Podmiot
        public int? PodmiotId { get; set; }
    }
}