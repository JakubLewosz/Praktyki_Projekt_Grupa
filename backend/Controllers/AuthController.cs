using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;

        public AuthController(UserManager<ApplicationUser> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginDto)
        {
            var user = await _userManager.FindByNameAsync(loginDto.Username);
            if (user == null)
            {
                user = await _userManager.FindByEmailAsync(loginDto.Username);
            }

            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
            {
                return Unauthorized(new { message = "Nieprawidłowa nazwa użytkownika lub hasło." });
            }

            var authResponse = GenerateJwtToken(user);

            return Ok(authResponse);
        }

        // Metoda pomocnicza do generowania tokenu
        private AuthResponseDto GenerateJwtToken(ApplicationUser user)
        {
            // --- OBLICZANIE STATUSU isActive ---
            bool isActive = user.LockoutEnd == null || user.LockoutEnd <= DateTimeOffset.Now;

            // 1. Tworzymy listę STANDARDOWYCH claimów (tekstowych)
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Role, user.Rola.ToString())
                // UWAGA: Usunąłem stąd isActive, aby nie zostało zamienione na string "true"
            };

            if (user.Rola == RolaUzytkownika.Podmiot && user.PodmiotId.HasValue)
            {
                claims.Add(new Claim("podmiotId", user.PodmiotId.Value.ToString()));
            }

            // 2. Konfiguracja klucza i podpisu
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiration = DateTime.Now.AddHours(8);

            // 3. RĘCZNE TWORZENIE PAYLOADU (To jest kluczowa zmiana)
            // Dzięki temu możemy dodać typy inne niż string (np. boolean)
            var payload = new JwtPayload(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                notBefore: null,
                expires: expiration
            );

            // --- WYMUSZENIE TYPU BOOLEAN ---
            // Dodajemy isActive bezpośrednio do słownika payloadu jako bool.
            // Serializer JSON teraz poprawnie zapisze to jako true/false (bez cudzysłowów).
            payload["isActive"] = isActive;

            // 4. Sklejenie nagłówka i payloadu w token
            var token = new JwtSecurityToken(new JwtHeader(creds), payload);

            return new AuthResponseDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Expiration = expiration,
                Username = user.UserName!,
                Role = user.Rola.ToString()
            };
        }
    }
}