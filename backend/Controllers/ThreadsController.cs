using backend.DTOs;
using backend.Models;
using backend.Services;
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
    [Authorize] // Wymaga zalogowania (działa dla Admina, Merytorycznego i Podmiotu)
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
            return await _userManager.Users
                .Include(u => u.Podmiot)
                .Include(u => u.Grupy)
                .FirstOrDefaultAsync(u => u.Id == GetUserId());
        }

        // ==========================================
        // 1. LISTA WĄTKÓW (GET /api/threads)
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetThreadsList()
        {
            var user = await GetCurrentUserAsync();
            if (user == null) return Unauthorized();

            IQueryable<Watek> query;

            if (user.Rola == RolaUzytkownika.Podmiot)
            {
                // LOGIKA DLA UŻYTKOWNIKA (SIGMY)
                if (!user.PodmiotId.HasValue) return Forbid("Użytkownik podmiotu nie jest przypisany do podmiotu.");

                // 1. Pobierz grupy podmiotu
                var podmiot = await _context.Podmioty
                    .Include(p => p.Grupy)
                    .FirstOrDefaultAsync(p => p.Id == user.PodmiotId.Value);

                if (podmiot == null) return Forbid("Podmiot nie istnieje.");

                var grupyPodmiotuIds = podmiot.Grupy.Select(g => g.Id).ToList();

                // 2. Filtruj wątki
                query = _context.Watki
                    .Include(w => w.Grupa)
                    .Include(w => w.Wiadomosci).ThenInclude(m => m.Autor)
                    .Where(w => 
                        // Widzi broadcasty do swoich grup
                        (grupyPodmiotuIds.Contains(w.GrupaId)) ||
                        // LUB wątki, w których brał udział (jest autorem jakiejś wiadomości)
                        (w.Wiadomosci.Any(m => m.AutorId == user.Id))
                    );
            }
            else if (user.Rola == RolaUzytkownika.MerytorycznyUKNF)
            {
                var grupyUzytkownikaIds = user.Grupy.Select(g => g.Id).ToList();
                query = _context.Watki
                    .Include(w => w.Grupa)
                    .Include(w => w.Wiadomosci).ThenInclude(m => m.Autor)
                    .Where(w => grupyUzytkownikaIds.Contains(w.GrupaId));
            }
            else
            {
                // Admin korzysta z innego endpointu (/api/admin/wiadomosci), tu dajemy Forbid
                return Forbid("Administratorzy korzystają z dedykowanego panelu.");
            }

            var watkiDto = await query
                .Select(w => new ThreadListDto
                {
                    Id = w.Id,
                    Temat = w.Temat,
                    GrupaNazwa = w.Grupa.Nazwa,
                    // Bezpieczne pobieranie danych ostatniej wiadomości
                    OstatniaWiadomoscData = w.Wiadomosci.OrderByDescending(m => m.DataWyslania).Select(m => m.DataWyslania).FirstOrDefault(),
                    OstatniaWiadomoscAutor = w.Wiadomosci.OrderByDescending(m => m.DataWyslania).Select(m => m.Autor.UserName).FirstOrDefault() ?? "Brak",
                    OstatniaWiadomoscFragment = w.Wiadomosci.OrderByDescending(m => m.DataWyslania).Select(m => m.Tresc).FirstOrDefault() ?? "Brak wiadomości"
                })
                .OrderByDescending(w => w.OstatniaWiadomoscData)
                .ToListAsync();

            // Przycinanie tekstu
            foreach (var watekDto in watkiDto)
            {
                if (watekDto.OstatniaWiadomoscFragment.Length > 100)
                {
                    watekDto.OstatniaWiadomoscFragment = watekDto.OstatniaWiadomoscFragment.Substring(0, 100) + "...";
                }
            }

            return Ok(watkiDto);
        }

        // ==========================================
        // 2. SZCZEGÓŁY WĄTKU (GET /api/threads/{id})
        // ==========================================
        [HttpGet("{id}")]
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

            // --- WERYFIKACJA UPRAWNIEŃ DLA UŻYTKOWNIKA ---
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

            // Mapowanie na DTO
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
                        NazwaWyswietlana = (m.Autor.Rola == RolaUzytkownika.Podmiot) ? (m.Autor.Podmiot?.Nazwa ?? "Podmiot") : "UKNF",
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

        // ==========================================
        // 3. ODPOWIEDŹ (POST /api/threads/{id}/reply)
        // ==========================================
        [HttpPost("{id}/reply")]
        public async Task<IActionResult> ReplyToThread(int id, [FromBody] ReplyToThreadDto dto)
        {
            var autor = await GetCurrentUserAsync();
            if (autor == null) return Unauthorized();
            
            var watek = await _context.Watki
                .Include(w => w.Wiadomosci).ThenInclude(m => m.Autor)
                .Include(w => w.Grupa)
                .FirstOrDefaultAsync(w => w.Id == id);
            
            if (watek == null) return NotFound("Wątek nie istnieje.");
            
            var zalaczniki = await _threadService.PobierzZalacznikiAsync(dto.ZalacznikIds);

            // LOGIKA "MAGII": Jeśli Podmiot odpowiada na ogólny broadcast -> tworzymy nowy wątek
            if (autor.Rola == RolaUzytkownika.Podmiot && _threadService.CzyWatekJestBroadcastem(watek))
            {
                var nowyWatek = await _threadService.ObsluzOdpowiedzNaBroadcastAsync(watek, dto.Tresc, autor, zalaczniki);
                return Ok(new { message = "Odpowiedź na broadcast utworzyła nowy wątek.", watekId = nowyWatek.Id });
            }
            
            // Standardowa odpowiedź (dopisanie do istniejącego wątku)
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

        // --- TWORZENIE NOWEGO WĄTKU (POST /api/threads/create) ---
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

        // --- BROADCAST (Dla UKNF) ---
        [HttpPost("broadcast")]
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
    }
}