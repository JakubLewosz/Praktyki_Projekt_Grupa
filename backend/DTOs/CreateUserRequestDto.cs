using backend.Models;
using System.Collections.Generic;
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

        // Opcjonalne: Tylko dla Podmiotu
        public int? PodmiotId { get; set; }

        // NOWE POLE: Opcjonalne przypisanie do grup (dla Merytorycznego)
        public List<int> GrupyIds { get; set; } = new List<int>();
    }
}