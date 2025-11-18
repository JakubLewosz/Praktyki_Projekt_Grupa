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
    [Authorize] 
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

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        private async Task<ApplicationUser?> GetCurrentUserAsync()
        {
            return await _userManager.Users
                .Include(u => u.Podmiot)
                .Include(u => u.Grupy)
                .FirstOrDefaultAsync(u => u.Id == GetUserId());
        }

        // ==========================================
        // 1. LISTA WĄTKÓW (WSPÓLNA - INTELIGENTNA)
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetThreadsList()
        {
            var user = await GetCurrentUserAsync();
            if (user == null) return Unauthorized();

            IQueryable<Watek> query;

            if (user.Rola == RolaUzytkownika.Podmiot)
            {
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
                        (grupyPodmiotuIds.Contains(w.GrupaId) && !w.Wiadomosci.Any(m => m.Autor.Rola == RolaUzytkownika.Podmiot && m.Autor.PodmiotId != user.PodmiotId)) || 
                        (w.Wiadomosci.Any(m => m.AutorId == user.Id))
                    );
                 // Mała poprawka w logice wyżej: Podmiot widzi broadcasty w swojej grupie ORAZ swoje wątki.
                 // Filtrujemy, żeby nie widział wątków INNYCH podmiotów w tej samej grupie (jeśli by takie były).
                 // Najbezpieczniej: Widzi wątki gdzie GrupaId pasuje I (Jest to broadcast [brak wiadomości podmiotów innych niż on] LUB on tam pisał).
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
                return Forbid("Administratorzy korzystają z dedykowanego panelu.");
            }

            var watkiDto = await query
                .Select(w => new ThreadListDto
                {
                    Id = w.Id,
                    Temat = w.Temat,
                    GrupaNazwa = w.Grupa.Nazwa,
                    OstatniaWiadomoscData = w.Wiadomosci.OrderByDescending(m => m.DataWyslania).Select(m => m.DataWyslania).FirstOrDefault(),
                    OstatniaWiadomoscAutor = w.Wiadomosci.OrderByDescending(m => m.DataWyslania).Select(m => m.Autor.UserName).FirstOrDefault() ?? "Brak",
                    OstatniaWiadomoscFragment = w.Wiadomosci.OrderByDescending(m => m.DataWyslania).Select(m => m.Tresc).FirstOrDefault() ?? "Brak wiadomości"
                })
                .OrderByDescending(w => w.OstatniaWiadomoscData)
                .ToListAsync();

            foreach (var watekDto in watkiDto)
            {
                if (watekDto.OstatniaWiadomoscFragment.Length > 100)
                    watekDto.OstatniaWiadomoscFragment = watekDto.OstatniaWiadomoscFragment.Substring(0, 100) + "...";
            }

            return Ok(watkiDto);
        }

        // ==========================================
        // 2. SZCZEGÓŁY WĄTKU
        // ==========================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetThreadDetails(int id)
        {
            var user = await GetCurrentUserAsync();
            if (user == null) return Unauthorized();

            var watek = await _context.Watki
                .Include(w => w.Grupa)
                .Include(w => w.Wiadomosci).ThenInclude(m => m.Autor).ThenInclude(a => a.Podmiot) 
                .Include(w => w.Wiadomosci).ThenInclude(m => m.Zalaczniki)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (watek == null) return NotFound("Wątek nie istnieje.");

            if (user.Rola == RolaUzytkownika.Podmiot)
            {
                if (!user.PodmiotId.HasValue) return Forbid();
                var podmiot = await _context.Podmioty.Include(p => p.Grupy).FirstOrDefaultAsync(p => p.Id == user.PodmiotId.Value);
                if (podmiot == null) return Forbid();

                var grupyPodmiotuIds = podmiot.Grupy.Select(g => g.Id).ToList();
                bool jestBroadcastemDoGrupy = grupyPodmiotuIds.Contains(watek.GrupaId);
                bool jestAutorem = watek.Wiadomosci.Any(m => m.AutorId == user.Id);

                if (!jestBroadcastemDoGrupy && !jestAutorem) return Forbid();
            }
            else if (user.Rola == RolaUzytkownika.MerytorycznyUKNF)
            {
                var grupyUzytkownikaIds = user.Grupy.Select(g => g.Id).ToList();
                if (!grupyUzytkownikaIds.Contains(watek.GrupaId)) return Forbid();
            }

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
                    IsAdmin = m.Autor.Rola != RolaUzytkownika.Podmiot,
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
        // 3. ODPOWIEDŹ
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

        // ==========================================
        // 4. TWORZENIE PRZEZ PODMIOT
        // ==========================================
        [HttpPost("create")]
        [Authorize(Roles = "Podmiot")]
        public async Task<IActionResult> CreateThread([FromBody] CreateThreadDto dto)
        {
            var autor = await GetCurrentUserAsync();
            if (autor == null || !autor.PodmiotId.HasValue) return Unauthorized();
            
            var grupa = await _context.Grupy.FindAsync(dto.GrupaId);
            if (grupa == null) return BadRequest("Grupa nie istnieje.");

            var podmiot = await _context.Podmioty.Include(p => p.Grupy).FirstOrDefaultAsync(p => p.Id == autor.PodmiotId.Value);
            if (podmiot == null || !podmiot.Grupy.Contains(grupa)) return Forbid("Nie masz uprawnień do tej grupy.");
            
            var zalaczniki = await _threadService.PobierzZalacznikiAsync(dto.ZalacznikIds);

            var watek = new Watek { Temat = dto.Temat, GrupaId = dto.GrupaId };
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

        // ==========================================
        // 5. NOWY ENDPOINT: KNF MASOWA WYSYŁKA
        // ==========================================
        [HttpPost("knf/create")]
        [Authorize(Roles = "MerytorycznyUKNF")]
        public async Task<IActionResult> CreateKnfThread([FromBody] CreateKnfThreadDto dto)
        {
            var autor = await _userManager.FindByIdAsync(GetUserId());
            if (autor == null) return Unauthorized();

            var zalaczniki = await _threadService.PobierzZalacznikiAsync(dto.ZalacznikIds);
            int createdThreads = 0;

            // 1. Obsługa Broadcastów (Wysyłka do całych Grup)
            if (dto.GrupyIds != null)
            {
                foreach (var grupaId in dto.GrupyIds)
                {
                    // Sprawdzamy czy grupa istnieje (pomijamy błędy, jedziemy dalej)
                    var grupa = await _context.Grupy.FindAsync(grupaId);
                    if (grupa == null) continue;

                    // Tworzymy wątek broadcastowy (bez przypisanego konkretnego podmiotu)
                    var watek = new Watek { Temat = dto.Temat, GrupaId = grupaId };
                    _context.Watki.Add(watek);

                    var wiadomosc = new Wiadomosc
                    {
                        Tresc = dto.Tresc,
                        AutorId = autor.Id,
                        Watek = watek,
                        // Uwaga: w EF Core przy dodawaniu wielu obiektów z tym samym załącznikiem
                        // może być potrzebna ostrożność, ale tutaj tworzymy nową listę referencji
                        Zalaczniki = new List<Zalacznik>(zalaczniki) 
                    };
                    _context.Wiadomosci.Add(wiadomosc);
                    createdThreads++;
                }
            }

            // 2. Obsługa Wysyłki do konkretnych Podmiotów
            if (dto.PodmiotyIds != null)
            {
                foreach (var podmiotId in dto.PodmiotyIds)
                {
                    var podmiot = await _context.Podmioty
                        .Include(p => p.Grupy)
                        .FirstOrDefaultAsync(p => p.Id == podmiotId);
                    
                    if (podmiot == null) continue;

                    // Wątek musi mieć przypisaną Grupę (wymaganie bazy).
                    // Pobieramy pierwszą grupę podmiotu.
                    // Jeśli podmiot nie ma grupy, nie możemy stworzyć wątku w tym modelu.
                    var defaultGrupa = podmiot.Grupy.FirstOrDefault();
                    if (defaultGrupa == null) continue; 

                    // Tworzymy wątek, który teoretycznie jest "indywidualny"
                    // W tym modelu broadcast vs indywidualny różni się tym, czy podmiot odpowiada.
                    // Tutaj po prostu tworzymy wątek w grupie podmiotu.
                    var watek = new Watek { Temat = dto.Temat, GrupaId = defaultGrupa.Id };
                    _context.Watki.Add(watek);

                    var wiadomosc = new Wiadomosc
                    {
                        Tresc = dto.Tresc,
                        AutorId = autor.Id,
                        Watek = watek,
                        Zalaczniki = new List<Zalacznik>(zalaczniki)
                    };
                    _context.Wiadomosci.Add(wiadomosc);
                    createdThreads++;
                }
            }

            await _context.SaveChangesAsync();
            
            return Ok(new { message = $"Wysłano wiadomości. Utworzono wątków: {createdThreads}" });
        }
    }
}