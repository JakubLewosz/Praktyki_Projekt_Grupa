using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic; // Potrzebne dla List
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Cały kontroler wymaga zalogowania
    public class ThreadsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ThreadService _threadService;

        public ThreadsController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            ThreadService threadService)
        {
            _context = context;
            _userManager = userManager;
            _threadService = threadService;
        }

        // Pobieranie ID użytkownika z tokenu JWT
        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // Metoda pomocnicza do pobrania aktualnego użytkownika
        private async Task<ApplicationUser?> GetCurrentUserAsync()
        {
            // Dołączamy informacje o Podmiocie i Grupach, będą potrzebne
            return await _userManager.Users
                .Include(u => u.Podmiot)
                .Include(u => u.Grupy)
                .FirstOrDefaultAsync(u => u.Id == GetUserId());
        }

        // ---
        // --- ENDPOINTY KROKU 7 (GET) ---
        // ---

        [HttpGet] // GET /api/threads
        public async Task<IActionResult> GetThreadsList()
        {
            var user = await GetCurrentUserAsync();
            if (user == null) return Unauthorized();

            IQueryable<Watek> query;

            if (user.Rola == RolaUzytkownika.Podmiot)
            {
                // 1. Logika dla Podmiotu
                if (!user.PodmiotId.HasValue) return Forbid("Użytkownik podmiotu nie jest przypisany do podmiotu.");

                var podmiot = await _context.Podmioty
                    .Include(p => p.Grupy)
                    .FirstOrDefaultAsync(p => p.Id == user.PodmiotId.Value);

                if (podmiot == null) return Forbid("Podmiot nie istnieje.");

                var grupyPodmiotuIds = podmiot.Grupy.Select(g => g.Id).ToList();

                query = _context.Watki
                    .Include(w => w.Grupa)
                    .Include(w => w.Wiadomosci).ThenInclude(m => m.Autor)
                    .Where(w => 
                        (grupyPodmiotuIds.Contains(w.GrupaId)) ||
                        (w.Wiadomosci.Any(m => m.AutorId == user.Id))
                    );
            }
            else if (user.Rola == RolaUzytkownika.MerytorycznyUKNF)
            {
                // 2. Logika dla Użytkownika Merytorycznego UKNF
                var grupyUzytkownikaIds = user.Grupy.Select(g => g.Id).ToList();

                query = _context.Watki
                    .Include(w => w.Grupa)
                    .Include(w => w.Wiadomosci).ThenInclude(m => m.Autor)
                    .Where(w => grupyUzytkownikaIds.Contains(w.GrupaId));
            }
            else
            {
                return Forbid("Administratorzy nie mają dostępu do wiadomości.");
            }

            // Projekcja wyników na DTO
            var watkiDto = await query
                .Select(w => new ThreadListDto // To jest linia ~88
                {
                    Id = w.Id,
                    Temat = w.Temat,
                    GrupaNazwa = w.Grupa.Nazwa,
                    OstatniaWiadomoscData = w.Wiadomosci.OrderByDescending(m => m.DataWyslania).Select(m => m.DataWyslania).FirstOrDefault(),
                    OstatniaWiadomoscAutor = w.Wiadomosci.OrderByDescending(m => m.DataWyslania).Select(m => m.Autor.UserName).FirstOrDefault() ?? "Brak",
                    OstatniaWiadomoscFragment = w.Wiadomosci.OrderByDescending(m => m.DataWyslania).Select(m => m.Tresc).FirstOrDefault() ?? "Brak wiadomości"
                })
                .OrderByDescending(w => w.OstatniaWiadomoscData)
                .ToListAsync(); // To jest linia ~98

            // Poprawka dla fragmentu, aby uniknąć błędów
            foreach (var watekDto in watkiDto)
            {
                if (watekDto.OstatniaWiadomoscFragment.Length > 100)
                {
                    watekDto.OstatniaWiadomoscFragment = watekDto.OstatniaWiadomoscFragment.Substring(0, 100) + "...";
                }
            }

            return Ok(watkiDto);
        }

        [HttpGet("{id}")] // GET /api/threads/{id}
        public async Task<IActionResult> GetThreadDetails(int id)
        {
            var user = await GetCurrentUserAsync();
            if (user == null) return Unauthorized();

            var watek = await _context.Watki
                .Include(w => w.Grupa)
                .Include(w => w.Wiadomosci)
                    .ThenInclude(m => m.Autor)
                    .ThenInclude(a => a.Podmiot) 
                .Include(w => w.Wiadomosci)
                    .ThenInclude(m => m.Zalaczniki)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (watek == null) return NotFound("Wątek nie istnieje.");

            // --- Sprawdzanie Uprawnień (Kluczowe!) ---
            if (user.Rola == RolaUzytkownika.Podmiot)
            {
                if (!user.PodmiotId.HasValue) return Forbid();
                
                var podmiot = await _context.Podmioty.Include(p => p.Grupy).FirstOrDefaultAsync(p => p.Id == user.PodmiotId.Value);
                if (podmiot == null) return Forbid();

                var grupyPodmiotuIds = podmiot.Grupy.Select(g => g.Id).ToList();

                bool jestBroadcastemDoGrupy = grupyPodmiotuIds.Contains(watek.GrupaId);
                bool jestAutorem = watek.Wiadomosci.Any(m => m.AutorId == user.Id);

                if (!jestBroadcastemDoGrupy && !jestAutorem)
                {
                    return Forbid("Nie masz dostępu do tego wątku.");
                }
            }
            else if (user.Rola == RolaUzytkownika.MerytorycznyUKNF)
            {
                var grupyUzytkownikaIds = user.Grupy.Select(g => g.Id).ToList();
                if (!grupyUzytkownikaIds.Contains(watek.GrupaId))
                {
                    return Forbid("Nie masz dostępu do tej grupy wątków.");
                }
            }
            else
            {
                return Forbid(); // Admin nie ma dostępu
            }

            // --- Mapowanie na DTO ---
            var dto = new ThreadDetailsDto
            {
                Id = watek.Id,
                Temat = watek.Temat,
                GrupaNazwa = watek.Grupa.Nazwa,
                Wiadomosci = watek.Wiadomosci.OrderBy(m => m.DataWyslania).Select(m => new MessageDto
                {
                    Id = m.Id,
                    Tresc = m.Tresc,
                    DataWyslania = m.DataWyslania,
                    Autor = new AuthorDto
                    {
                        Id = m.Autor.Id,
                        NazwaWyswietlana = (m.Autor.Rola == RolaUzytkownika.Podmiot) ? m.Autor.Podmiot!.Nazwa : "UKNF",
                        Rola = m.Autor.Rola.ToString()
                    },
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

        // ---
        // --- ENDPOINTY KROKU 6 (POST) ---
        // ---

        [HttpPost("broadcast")] // To jest linia ~160
        [Authorize(Roles = "MerytorycznyUKNF")]
        public async Task<IActionResult> BroadcastMessage([FromBody] BroadcastMessageDto dto)
        {
            var autor = await _userManager.FindByIdAsync(GetUserId());
            if (autor == null) return Unauthorized();

            var grupa = await _context.Grupy.FindAsync(dto.GrupaId);
            if (grupa == null) return BadRequest("Grupa nie istnieje.");

            var zalaczniki = await _threadService.PobierzZalacznikiAsync(dto.ZalacznikIds);

            var watek = new Watek
            {
                Temat = dto.Temat,
                GrupaId = dto.GrupaId
            };
            _context.Watki.Add(watek);

            var wiadomosc = new Wiadomosc
            {
                Tresc = dto.Tresc,
                AutorId = autor.Id,
                Watek = watek,
                Zalaczniki = zalaczniki
            };
            _context.Wiadomosci.Add(wiadomosc);

            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Wiadomość grupowa wysłana.", watekId = watek.Id });
        }

        [HttpPost("create")]
        [Authorize(Roles = "Podmiot")]
        public async Task<IActionResult> CreateThread([FromBody] CreateThreadDto dto)
        {
            var autor = await GetCurrentUserAsync();
            if (autor == null || !autor.PodmiotId.HasValue) return Unauthorized();
            
            var grupa = await _context.Grupy.FindAsync(dto.GrupaId);
            if (grupa == null) return BadRequest("Grupa nie istnieje.");

            var podmiot = await _context.Podmioty
                .Include(p => p.Grupy)
                .FirstOrDefaultAsync(p => p.Id == autor.PodmiotId.Value);
            
            if (podmiot == null || !podmiot.Grupy.Contains(grupa))
            {
                return Forbid("Nie masz uprawnień do wysyłania w tej grupie.");
            }
            
            var zalaczniki = await _threadService.PobierzZalacznikiAsync(dto.ZalacznikIds);

            var watek = new Watek
            {
                Temat = dto.Temat,
                GrupaId = dto.GrupaId
            };
            _context.Watki.Add(watek);
            
            var wiadomosc = new Wiadomosc
            {
                Tresc = dto.Tresc,
                AutorId = autor.Id,
                Watek = watek,
                Zalaczniki = zalaczniki
            };
            _context.Wiadomosci.Add(wiadomosc);

            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Wątek stworzony.", watekId = watek.Id });
        }
        
        [HttpPost("{id}/reply")]
        public async Task<IActionResult> ReplyToThread(int id, [FromBody] ReplyToThreadDto dto)
        {
            var autor = await GetCurrentUserAsync();
            if (autor == null) return Unauthorized();
            
            var watek = await _context.Watki
                .Include(w => w.Wiadomosci).ThenInclude(m => m.Autor).ThenInclude(a => a.Podmiot)
                .Include(w => w.Grupa)
                .FirstOrDefaultAsync(w => w.Id == id);
            
            if (watek == null) return NotFound("Wątek nie istnieje.");
            
            var zalaczniki = await _threadService.PobierzZalacznikiAsync(dto.ZalacznikIds);

            if (autor.Rola == RolaUzytkownika.Podmiot && _threadService.CzyWatekJestBroadcastem(watek))
            {
                var nowyWatek = await _threadService.ObsluzOdpowiedzNaBroadcastAsync(watek, dto.Tresc, autor, zalaczniki);
                return Ok(new { message = "Odpowiedź na broadcast utworzyła nowy wątek.", watekId = nowyWatek.Id });
            }
            
            var wiadomosc = new Wiadomosc
            {
                Tresc = dto.Tresc,
                AutorId = autor.Id,
                WatekId = watek.Id,
                Zalaczniki = zalaczniki
            };

            _context.Wiadomosci.Add(wiadomosc);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Odpowiedź dodana.", watekId = watek.Id });
        }
    }
}