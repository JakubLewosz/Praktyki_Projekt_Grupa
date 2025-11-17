using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

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
                // Sprawdzamy, czy podmiot istnieje I czy jest aktywny
                // Nie chcemy pozwolić na przypisanie użytkownika do zablokowanego podmiotu
                var podmiot = await _context.Podmioty.FindAsync(dto.PodmiotId.Value);
                if (podmiot == null)
                {
                    return BadRequest(new { message = "Podany Podmiot nie istnieje." });
                }
                if (!podmiot.IsActive)
                {
                    return BadRequest(new { message = "Nie można przypisać użytkownika do nieaktywnego podmiotu." });
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

        [HttpPut("users/{id}")]
        public async Task<IActionResult> EditUser(string id, [FromBody] EditUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound("Użytkownik nie znaleziony.");

            if (dto.Rola == RolaUzytkownika.Podmiot && !dto.PodmiotId.HasValue)
            {
                return BadRequest("PodmiotId jest wymagany dla użytkownika typu Podmiot.");
            }
            if (dto.PodmiotId.HasValue)
            {
                var podmiotExists = await _context.Podmioty.AnyAsync(p => p.Id == dto.PodmiotId.Value);
                if (!podmiotExists)
                {
                    return BadRequest("Podany Podmiot nie istnieje.");
                }
            }

            user.UserName = dto.Username;
            user.Email = dto.Email;
            user.Rola = dto.Rola;
            user.PodmiotId = (dto.Rola == RolaUzytkownika.Podmiot) ? dto.PodmiotId : null;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new { message = "Użytkownik zaktualizowany." });
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
            var podmiot = new Podmiot 
            { 
                Nazwa = dto.Nazwa, 
                IsActive = true,
                NIP = dto.NIP,
                REGON = dto.REGON
            };
            _context.Podmioty.Add(podmiot);
            await _context.SaveChangesAsync();
            return Ok(podmiot);
        }

        [HttpPut("podmioty/{id}")]
        public async Task<IActionResult> EditPodmiot(int id, [FromBody] EditPodmiotDto dto)
        {
            var podmiot = await _context.Podmioty.FindAsync(id);
            if (podmiot == null) return NotFound("Podmiot nie znaleziony.");

            podmiot.Nazwa = dto.Nazwa;
            podmiot.NIP = dto.NIP;
            podmiot.REGON = dto.REGON;
            
            await _context.SaveChangesAsync();
            
            return Ok(podmiot);
        }

        // --- ZMODYFIKOWANY ENDPOINT (FILTROWANIE) ---
        [HttpGet("podmioty")]
        public async Task<IActionResult> GetPodmioty([FromQuery] string status = "active")
        {
            IQueryable<Podmiot> query = _context.Podmioty;

            // Domyślnie (status="active") zwracamy tylko aktywne podmioty.
            // Frontend użyje tego do dropdowna przy tworzeniu usera.
            if (status != "all")
            {
                query = query.Where(p => p.IsActive);
            }
            // Jeśli status="all", zwracamy wszystkie (dla listy w panelu admina)

            return Ok(await query.ToListAsync());
        }
        // --- KONIEC MODYFIKACJI ---

        [HttpPut("podmioty/{id}/disable")]
        public async Task<IActionResult> DisablePodmiot(int id)
        {
            var podmiot = await _context.Podmioty.FindAsync(id);
            if (podmiot == null) return NotFound("Podmiot nie znaleziony.");
            
            podmiot.IsActive = false;
            await _context.SaveChangesAsync();
            
            return Ok(podmiot);
        }

        [HttpPut("podmioty/{id}/enable")]
        public async Task<IActionResult> EnablePodmiot(int id)
        {
            var podmiot = await _context.Podmioty.FindAsync(id);
            if (podmiot == null) return NotFound("Podmiot nie znaleziony.");

            podmiot.IsActive = true;
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
        
        [HttpGet("grupy/{id}")]
        public async Task<IActionResult> GetGrupa(int id)
        {
            var grupa = await _context.Grupy
                .Where(g => g.Id == id)
                .Select(g => new
                {
                    g.Id,
                    g.Nazwa,
                    g.IsActive,
                    Podmioty = g.Podmioty.Select(p => new { p.Id, p.Nazwa, p.NIP, p.REGON }),
                    UzytkownicyMerytoryczni = g.UzytkownicyMerytoryczni.Select(u => new { u.Id, u.UserName })
                })
                .FirstOrDefaultAsync();

            if (grupa == null) return NotFound("Grupa nie znaleziona.");

            return Ok(grupa);
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

        [HttpDelete("grupy/{grupaId}/podmioty/{podmiotId}")]
        public async Task<IActionResult> RemovePodmiotFromGrupa(int grupaId, int podmiotId)
        {
            var grupa = await _context.Grupy
                .Include(g => g.Podmioty)
                .FirstOrDefaultAsync(g => g.Id == grupaId);

            if (grupa == null)
            {
                return NotFound("Grupa nie znaleziona.");
            }

            var podmiot = grupa.Podmioty.FirstOrDefault(p => p.Id == podmiotId);

            if (podmiot == null)
            {
                return NotFound("Podmiot nie jest przypisany do tej grupy.");
            }

            grupa.Podmioty.Remove(podmiot);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("assign-user-to-grupa")]
        public async Task<IActionResult> AssignGrupaToUser([FromBody] AssignGrupaToUserDto dto)
        {
            var user = await _userManager.Users
                .Include(u => u.Grupy)
                .FirstOrDefaultAsync(u => u.Id == dto.UserId);
            
            if (user == null) return NotFound("Użytkownik nie znaleziony.");

            if (user.Rola != RolaUzytkownika.MerytorycznyUKNF)
            {
                return BadRequest("Tylko Użytkownicy Merytoryczni UKNF mogą być przypisywani do grup.");
            }

            var grupa = await _context.Grupy.FindAsync(dto.GrupaId);
            if (grupa == null) return NotFound("Grupa nie znaleziona.");

            if (!user.Grupy.Contains(grupa))
            {
                user.Grupy.Add(grupa);
                await _userManager.UpdateAsync(user);
            }

            return Ok(new { message = "Użytkownik merytoryczny przypisany do grupy." });
        }
    }
}