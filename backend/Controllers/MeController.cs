using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Cały kontroler wymaga zalogowania
    public class MeController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public MeController(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        // Endpoint, o który prosił Twój kolega: GET /api/me/grupy
        [HttpGet("grupy")]
        public async Task<IActionResult> GetMyGroups()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // Pobieramy użytkownika, aby sprawdzić jego ROLĘ i PODMIOTID
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("Użytkownik nie znaleziony.");
            }

            ICollection<Grupa> userGroups = new List<Grupa>();

            if (user.Rola == RolaUzytkownika.Podmiot)
            {
                // Dla Podmiotu: znajdź jego Podmiot, a następnie Grupy tego Podmiotu
                if (!user.PodmiotId.HasValue)
                {
                    // Użytkownik Podmiotu nieprzypisany do niczego - zwraca pustą listę
                    return Ok(new List<object>()); 
                }

                var podmiot = await _context.Podmioty
                    .Include(p => p.Grupy) // Kluczowe: Dołączamy Grupy
                    .FirstOrDefaultAsync(p => p.Id == user.PodmiotId.Value);

                if (podmiot != null)
                {
                    userGroups = podmiot.Grupy;
                }
            }
            else if (user.Rola == RolaUzytkownika.MerytorycznyUKNF)
            {
                // Dla Merytorycznego: znajdź Grupy przypisane bezpośrednio do niego
                // Musimy pobrać użytkownika jeszcze raz, tym razem z jego Grupami
                var merytorycznyUser = await _userManager.Users
                    .Include(u => u.Grupy) // Kluczowe: Dołączamy Grupy
                    .FirstOrDefaultAsync(u => u.Id == userId);
                
                if (merytorycznyUser != null)
                {
                    userGroups = merytorycznyUser.Grupy;
                }
            }
            // Admin i inni domyślnie dostaną pustą listę

            // Zwracamy listę w prostym formacie { id, nazwa }
            var result = userGroups
                .Where(g => g.IsActive) // Zwracamy tylko aktywne grupy
                .Select(g => new 
                {
                    g.Id,
                    g.Nazwa
                }).ToList();

            return Ok(result);
        }
    }
}