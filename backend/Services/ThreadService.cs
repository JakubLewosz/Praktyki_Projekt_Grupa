using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class ThreadService
    {
        private readonly ApplicationDbContext _context;

        public ThreadService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Metoda pomocnicza do pobierania załączników z bazy
        public async Task<List<Zalacznik>> PobierzZalacznikiAsync(List<int> ids)
        {
            if (ids == null || !ids.Any())
            {
                return new List<Zalacznik>();
            }

            return await _context.Zalaczniki
                .Where(z => ids.Contains(z.Id))
                .ToListAsync();
        }

        // Metoda do obsługi odpowiedzi na broadcast (wiadomość grupową)
        public async Task<Watek> ObsluzOdpowiedzNaBroadcastAsync(Watek oryginalnyWatek, string tresc, ApplicationUser autor, List<Zalacznik> zalaczniki)
        {
            var nowyIndywidualnyWatek = new Watek
            {
                Temat = $"Odp: {oryginalnyWatek.Temat} (Podmiot: {autor.Podmiot?.Nazwa})",
                GrupaId = oryginalnyWatek.GrupaId
            };
            
            _context.Watki.Add(nowyIndywidualnyWatek);
            
            var nowaWiadomosc = new Wiadomosc
            {
                Tresc = tresc,
                AutorId = autor.Id,
                Watek = nowyIndywidualnyWatek,
                Zalaczniki = zalaczniki
            };

            _context.Wiadomosci.Add(nowaWiadomosc);
            await _context.SaveChangesAsync();

            return nowyIndywidualnyWatek;
        }

        // Metoda sprawdzająca, czy wątek jest typu "broadcast"
        public bool CzyWatekJestBroadcastem(Watek watek)
        {
            if (watek == null || watek.Wiadomosci.Count == 0)
                return false;
            
            var pierwszaWiadomosc = watek.Wiadomosci.OrderBy(w => w.DataWyslania).FirstOrDefault();
            
            if (pierwszaWiadomosc == null || pierwszaWiadomosc.Autor.Rola == RolaUzytkownika.Podmiot)
                return false;

            return true;
        }
    }
}