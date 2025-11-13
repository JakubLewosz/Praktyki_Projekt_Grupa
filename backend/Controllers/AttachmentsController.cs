using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Wymagamy zalogowania, aby przesyłać pliki
    public class AttachmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        //
        // POPRAWKA: Zastąpiłem błędną gwiazdkę '*' poprawnym nawiasem '{'
        //
        public AttachmentsController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpPost("upload")]
        // Usunęliśmy [FromForm], aby naprawić błąd Swaggera z poprzedniego kroku
        public async Task<IActionResult> UploadAttachment(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Plik nie został przesłany.");
            }

            // Gwarantujemy, że folder 'uploads' istnieje
            var uploadPath = Path.Combine(_env.ContentRootPath, "uploads");
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            // Tworzymy unikalną nazwę pliku, aby uniknąć konfliktów
            var uniqueFileName = $"{Guid.NewGuid()}-{file.FileName}";
            var filePath = Path.Combine(uploadPath, uniqueFileName);

            // Zapisujemy plik fizycznie na serwerze
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Tworzymy wpis w bazie danych
            var attachment = new Zalacznik
            {
                OryginalnaNazwa = file.FileName,
                SciezkaPliku = $"uploads/{uniqueFileName}",
                TypMIME = file.ContentType,
                Rozmiar = file.Length
            };

            _context.Zalaczniki.Add(attachment);
            await _context.SaveChangesAsync();

            // Zwracamy DTO z ID i nazwą
            var responseDto = new UploadAttachmentResponseDto
            {
                Id = attachment.Id,
                OryginalnaNazwa = attachment.OryginalnaNazwa,
                SciezkaPliku = attachment.SciezkaPliku
            };

            return Ok(responseDto);
        }
    }
}