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

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("Użytkownik nie znaleziony.");
            }

            ICollection<Grupa> userGroups = new List<Grupa>();

            if (user.Rola == RolaUzytkownika.Podmiot)
            {
                if (!user.PodmiotId.HasValue)
                {
                    return Ok(new List<object>()); 
                }

                var podmiot = await _context.Podmioty
                    .Include(p => p.Grupy)
                    .FirstOrDefaultAsync(p => p.Id == user.PodmiotId.Value);

                if (podmiot != null)
                {
                    userGroups = podmiot.Grupy;
                }
            }
            else if (user.Rola == RolaUzytkownika.MerytorycznyUKNF)
            {
                var merytorycznyUser = await _userManager.Users
                    .Include(u => u.Grupy)
                    .FirstOrDefaultAsync(u => u.Id == userId);
                
                if (merytorycznyUser != null)
                {
                    userGroups = merytorycznyUser.Grupy;
                }
            }
            
            var result = userGroups
                .Where(g => g.IsActive)
                .Select(g => new 
                {
                    g.Id,
                    g.Nazwa
                }).ToList();

            return Ok(result);
        }
    }
}