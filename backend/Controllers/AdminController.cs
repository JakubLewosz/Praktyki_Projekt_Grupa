using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

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

        // ==========================================
        // SEKCJA 1: ZARZĄDZANIE UŻYTKOWNIKAMI
        // ==========================================

        // ZMODYFIKOWANA METODA CREATE
        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestDto dto)
        {
            // 1. Walidacja dla Podmiotu
            if (dto.Rola == RolaUzytkownika.Podmiot && !dto.PodmiotId.HasValue)
            {
                return BadRequest(new { message = "PodmiotId jest wymagany dla użytkownika typu Podmiot." });
            }
            if (dto.PodmiotId.HasValue)
            {
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
            
            // 2. Tworzenie Użytkownika
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

            // 3. NOWOŚĆ: Przypisywanie grup przy tworzeniu (dla Merytorycznego)
            if (dto.Rola == RolaUzytkownika.MerytorycznyUKNF && dto.GrupyIds != null && dto.GrupyIds.Any())
            {
                var grupy = await _context.Grupy
                    .Where(g => dto.GrupyIds.Contains(g.Id))
                    .ToListAsync();

                foreach (var grupa in grupy)
                {
                    newUser.Grupy.Add(grupa);
                }
                
                // Zapisujemy powiązania
                await _userManager.UpdateAsync(newUser);
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

        // --- NOWE ENDPOINTY DLA GRUP UŻYTKOWNIKA ---

        // 1. Pobierz grupy przypisane do użytkownika
        [HttpGet("users/{id}/grupy")]
        public async Task<IActionResult> GetUserGroups(string id)
        {
            var user = await _userManager.Users
                .Include(u => u.Grupy)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound("Użytkownik nie znaleziony.");

            var grupyDto = user.Grupy.Select(g => new 
            {
                g.Id,
                g.Nazwa
            }).ToList();

            return Ok(grupyDto);
        }

        // 2. Aktualizuj przypisanie grup (Zastąp stare nowymi)
        [HttpPut("users/{id}/grupy")]
        public async Task<IActionResult> UpdateUserGroups(string id, [FromBody] UpdateUserGroupsDto dto)
        {
            // Pobieramy użytkownika wraz z jego obecnymi grupami (to ważne dla .Clear())
            var user = await _userManager.Users
                .Include(u => u.Grupy)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound("Użytkownik nie znaleziony.");

            // Tylko pracownik merytoryczny powinien mieć grupy (logika biznesowa)
            // Ale technicznie system pozwala każdemu. Możemy tu dodać walidację, jeśli chcesz.
            if (user.Rola != RolaUzytkownika.MerytorycznyUKNF)
            {
                 // Opcjonalnie: return BadRequest("Tylko pracownik merytoryczny może należeć do grup.");
                 // Na razie pozwalamy, by zachować elastyczność.
            }

            // 1. Wyczyść obecne przypisania
            user.Grupy.Clear();

            // 2. Pobierz nowe grupy z bazy
            if (dto.GrupyIds != null && dto.GrupyIds.Any())
            {
                var noweGrupy = await _context.Grupy
                    .Where(g => dto.GrupyIds.Contains(g.Id))
                    .ToListAsync();

                // 3. Dodaj nowe grupy
                foreach (var grupa in noweGrupy)
                {
                    user.Grupy.Add(grupa);
                }
            }

            // 4. Zapisz zmiany
            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded) return BadRequest(result.Errors);

            return Ok(new { message = "Grupy użytkownika zaktualizowane." });
        }
        // --- KONIEC NOWYCH ENDPOINTÓW ---


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

        // ==========================================
        // SEKCJA 2: ZARZĄDZANIE PODMIOTAMI
        // ==========================================

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

        [HttpGet("podmioty")]
        public async Task<IActionResult> GetPodmioty([FromQuery] string status = "active")
        {
            IQueryable<Podmiot> query = _context.Podmioty;

            if (status != "all")
            {
                query = query.Where(p => p.IsActive);
            }

            return Ok(await query.ToListAsync());
        }

        [HttpPut("podmioty/{id}/disable")]
        public async Task<IActionResult> DisablePodmiot(int id)
        {
            var podmiot = await _context.Podmioty.FindAsync(id);
            if (podmiot == null) return NotFound("Podmiot nie znaleziony.");
            
            // 1. Zablokuj podmiot
            podmiot.IsActive = false;

            // 2. Znajdź i zablokuj użytkowników
            var uzytkownicyDoBlokady = await _context.Users
                .Where(u => u.PodmiotId == id)
                .ToListAsync();

            foreach (var user in uzytkownicyDoBlokady)
            {
                user.LockoutEnd = DateTimeOffset.Now.AddYears(100);
            }

            await _context.SaveChangesAsync();
            
            return Ok(podmiot);
        }

        [HttpPut("podmioty/{id}/enable")]
        public async Task<IActionResult> EnablePodmiot(int id)
        {
            var podmiot = await _context.Podmioty.FindAsync(id);
            if (podmiot == null) return NotFound("Podmiot nie znaleziony.");

            // 1. Odblokuj TYLKO podmiot
            podmiot.IsActive = true;
            
            await _context.SaveChangesAsync();
            
            return Ok(podmiot);
        }

        // ==========================================
        // SEKCJA 3: ZARZĄDZANIE GRUPAMI
        // ==========================================

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

        // ==========================================
        // SEKCJA 4: ZARZĄDZANIE POWIĄZANIAMI
        // ==========================================

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

        // Ten endpoint (pojedyncze dodawanie) zostawiam, ale teraz masz już
        // lepszą metodę PUT UpdateUserGroups do masowej edycji.
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

        // ==========================================
        // SEKCJA 5: SKRZYNKA ADMINA (WIADOMOŚCI)
        // ==========================================

        [HttpGet("wiadomosci")]
        public async Task<IActionResult> GetAllThreads()
        {
            var threads = await _context.Watki
                .Include(w => w.Grupa)
                .Include(w => w.Wiadomosci)
                    .ThenInclude(m => m.Autor)
                    .ThenInclude(a => a.Podmiot)
                .OrderByDescending(w => w.Wiadomosci.Max(m => m.DataWyslania))
                .ToListAsync();

            var dtos = threads.Select(w => 
            {
                var ostatniaWiadomosc = w.Wiadomosci.OrderByDescending(m => m.DataWyslania).FirstOrDefault();
                var pierwszaWiadomosc = w.Wiadomosci.OrderBy(m => m.DataWyslania).FirstOrDefault();

                string nadawca = "Nieznany";
                if (pierwszaWiadomosc != null)
                {
                    if (pierwszaWiadomosc.Autor.Rola == RolaUzytkownika.Podmiot && pierwszaWiadomosc.Autor.Podmiot != null)
                        nadawca = pierwszaWiadomosc.Autor.Podmiot.Nazwa;
                    else if (pierwszaWiadomosc.Autor.Rola == RolaUzytkownika.MerytorycznyUKNF)
                        nadawca = $"Merytoryczny ({pierwszaWiadomosc.Autor.UserName})";
                    else
                        nadawca = "UKNF (Admin)";
                }

                bool isUnread = ostatniaWiadomosc != null && ostatniaWiadomosc.Autor.Rola == RolaUzytkownika.Podmiot;

                return new AdminThreadListDto
                {
                    Id = w.Id,
                    Temat = w.Temat,
                    NazwaGrupy = w.Grupa.Nazwa,
                    NazwaNadawcy = nadawca,
                    DataOstatniejWiadomosci = ostatniaWiadomosc?.DataWyslania ?? DateTime.MinValue,
                    CzyNieprzeczytany = isUnread
                };
            }).ToList();

            return Ok(dtos);
        }

        [HttpGet("wiadomosci/{id}")]
        public async Task<IActionResult> GetThreadDetails(int id)
        {
            var watek = await _context.Watki
                .Include(w => w.Grupa)
                .Include(w => w.Wiadomosci)
                    .ThenInclude(m => m.Autor)
                    .ThenInclude(a => a.Podmiot)
                .Include(w => w.Wiadomosci)
                    .ThenInclude(m => m.Zalaczniki)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (watek == null) return NotFound("Wątek nie istnieje.");

            var dto = new AdminThreadDetailsDto
            {
                Id = watek.Id,
                Temat = watek.Temat,
                NazwaGrupy = watek.Grupa.Nazwa,
                Wiadomosci = watek.Wiadomosci.OrderBy(m => m.DataWyslania).Select(m => new AdminMessageDto
                {
                    Id = m.Id,
                    Tresc = m.Tresc,
                    DataWyslania = m.DataWyslania,
                    AutorNazwa = (m.Autor.Rola == RolaUzytkownika.Podmiot) 
                        ? (m.Autor.Podmiot?.Nazwa ?? "Podmiot") 
                        : "UKNF",
                    IsAdmin = m.Autor.Rola != RolaUzytkownika.Podmiot,
                    Zalaczniki = m.Zalaczniki.Select(z => new AttachmentDto
                    {
                        Id = z.Id,
                        OryginalnaNazwa = z.OryginalnaNazwa,
                        SciezkaPliku = z.SciezkaPliku,
                        TypMIME = z.TypMIME,
                        Rozmiar = z.Rozmiar
                    }).ToList()
                }).ToList()
            };

            return Ok(dto);
        }

        [HttpPost("wiadomosci/{id}/odpowiedz")]
        public async Task<IActionResult> ReplyAsAdmin(int id, [FromBody] AdminReplyDto dto)
        {
            var adminUser = await _userManager.GetUserAsync(User);
            if (adminUser == null) return Unauthorized();

            var watek = await _context.Watki.FindAsync(id);
            if (watek == null) return NotFound("Wątek nie istnieje.");

            var wiadomosc = new Wiadomosc
            {
                Tresc = dto.Tresc,
                AutorId = adminUser.Id,
                WatekId = watek.Id,
                DataWyslania = DateTime.Now
            };

            _context.Wiadomosci.Add(wiadomosc);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Odpowiedź wysłana." });
        }
    }
}