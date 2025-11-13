using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "AdminUKNF")]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public AdminController(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        // --- Zarządzanie Użytkownikami ---

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestDto dto)
        {
            if (dto.Rola == RolaUzytkownika.Podmiot && !dto.PodmiotId.HasValue)
            {
                return BadRequest(new { message = "PodmiotId jest wymagany dla użytkownika typu Podmiot." });
            }
            if (dto.PodmiotId.HasValue)
            {
                var podmiotExists = await _context.Podmioty.AnyAsync(p => p.Id == dto.PodmiotId.Value);
                if (!podmiotExists)
                {
                    return BadRequest(new { message = "Podany Podmiot nie istnieje." });
                }
            }
            
            var newUser = new ApplicationUser
            {
                UserName = dto.Username,
                Email = dto.Email,
                Rola = dto.Rola,
                PodmiotId = (dto.Rola == RolaUzytkownika.Podmiot) ? dto.PodmiotId : null
            };

            var result = await _userManager.CreateAsync(newUser, dto.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new { message = "Użytkownik stworzony pomyślnie.", userId = newUser.Id });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userManager.Users
                .Select(u => new 
                {
                    u.Id,
                    u.UserName,
                    u.Email,
                    u.Rola,
                    u.PodmiotId,
                    IsDisabled = u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.Now
                })
                .ToListAsync();
            return Ok(users);
        }

        [HttpPut("users/{id}/disable")]
        public async Task<IActionResult> DisableUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound("Użytkownik nie znaleziony.");

            var result = await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.Now.AddYears(100));
            if (!result.Succeeded) return BadRequest(result.Errors);
            
            return Ok(new { message = "Użytkownik wyłączony."});
        }

        [HttpPut("users/{id}/enable")]
        public async Task<IActionResult> EnableUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound("Użytkownik nie znaleziony.");

            var result = await _userManager.SetLockoutEndDateAsync(user, null);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return Ok(new { message = "Użytkownik włączony."});
        }


        // --- Zarządzanie Podmiotami ---

        [HttpPost("podmioty")]
        public async Task<IActionResult> CreatePodmiot([FromBody] CreatePodmiotRequestDto dto)
        {
            var podmiot = new Podmiot { Nazwa = dto.Nazwa, IsActive = true };
            _context.Podmioty.Add(podmiot);
            await _context.SaveChangesAsync();
            return Ok(podmiot);
        }

        [HttpGet("podmioty")]
        public async Task<IActionResult> GetPodmioty()
        {
            return Ok(await _context.Podmioty.ToListAsync());
        }

        [HttpPut("podmioty/{id}/disable")]
        public async Task<IActionResult> DisablePodmiot(int id)
        {
            var podmiot = await _context.Podmioty.FindAsync(id);
            if (podmiot == null) return NotFound("Podmiot nie znaleziony.");
            
            podmiot.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(podmiot);
        }

        // --- Zarządzanie Grupami ---

        [HttpPost("grupy")]
        public async Task<IActionResult> CreateGrupa([FromBody] CreateGrupaRequestDto dto)
        {
            var grupa = new Grupa { Nazwa = dto.Nazwa, IsActive = true };
            _context.Grupy.Add(grupa);
            await _context.SaveChangesAsync();
            return Ok(grupa);
        }

        [HttpGet("grupy")]
        public async Task<IActionResult> GetGrupy()
        {
            return Ok(await _context.Grupy.ToListAsync());
        }
        
        [HttpPut("grupy/{id}/disable")]
        public async Task<IActionResult> DisableGrupa(int id)
        {
            var grupa = await _context.Grupy.FindAsync(id);
            if (grupa == null) return NotFound("Grupa nie znaleziona.");

            grupa.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(grupa);
        }


        // --- Zarządzanie Powiązaniami ---

        [HttpPost("assign-podmiot-to-grupa")]
        public async Task<IActionResult> AssignPodmiotToGrupa([FromBody] AssignPodmiotRequestDto dto)
        {
            var podmiot = await _context.Podmioty.Include(p => p.Grupy)
                                        .FirstOrDefaultAsync(p => p.Id == dto.PodmiotId);
            if (podmiot == null) return NotFound("Podmiot nie znaleziony.");

            var grupa = await _context.Grupy.FindAsync(dto.GrupaId);
            if (grupa == null) return NotFound("Grupa nie znaleziona.");

            if (!podmiot.Grupy.Contains(grupa))
            {
                podmiot.Grupy.Add(grupa);
                await _context.SaveChangesAsync();
            }
            
            return Ok(new { message = "Podmiot przypisany do grupy." });
        }

        // --- NOWY ENDPOINT (KROK 8) ---
        [HttpPost("assign-user-to-grupa")]
        public async Task<IActionResult> AssignGrupaToUser([FromBody] AssignGrupaToUserDto dto)
        {
            // Pobieramy użytkownika (upewniając się, że dołączamy jego listę grup)
            var user = await _userManager.Users
                .Include(u => u.Grupy)
                .FirstOrDefaultAsync(u => u.Id == dto.UserId);
            
            if (user == null) return NotFound("Użytkownik nie znaleziony.");

            // Tylko użytkownicy merytoryczni mogą być dodawani do grup
            if (user.Rola != RolaUzytkownika.MerytorycznyUKNF)
            {
                return BadRequest("Tylko Użytkownicy Merytoryczni UKNF mogą być przypisywani do grup.");
            }

            var grupa = await _context.Grupy.FindAsync(dto.GrupaId);
            if (grupa == null) return NotFound("Grupa nie znaleziona.");

            // Dodajemy grupę do kolekcji użytkownika
            if (!user.Grupy.Contains(grupa))
            {
                user.Grupy.Add(grupa);
                await _userManager.UpdateAsync(user); // Używamy UpdateAsync z UserManager
            }

            return Ok(new { message = "Użytkownik merytoryczny przypisany do grupy." });
        }
    }
}