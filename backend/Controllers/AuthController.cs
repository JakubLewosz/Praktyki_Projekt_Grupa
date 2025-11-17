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
            // 1. Znajdź użytkownika po nazwie (lub emailu)
            var user = await _userManager.FindByNameAsync(loginDto.Username);
            if (user == null)
            {
                user = await _userManager.FindByEmailAsync(loginDto.Username);
            }

            // 2. Sprawdź, czy użytkownik istnieje i czy hasło jest poprawne
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
            {
                return Unauthorized(new { message = "Nieprawidłowa nazwa użytkownika lub hasło." });
            }

            // 3. Generuj token (teraz zawiera isActive!)
            var authResponse = GenerateJwtToken(user);

            return Ok(authResponse);
        }

        // Metoda pomocnicza do generowania tokenu
        private AuthResponseDto GenerateJwtToken(ApplicationUser user)
        {
            // --- OBLICZANIE STATUSU isActive ---
            // Użytkownik jest aktywny, jeśli nie ma daty blokady LUB data blokady już minęła.
            bool isActive = user.LockoutEnd == null || user.LockoutEnd <= DateTimeOffset.Now;

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Role, user.Rola.ToString()),
                // --- NOWY CLAIM ---
                // Dodajemy flagę isActive ("true" lub "false")
                new Claim("isActive", isActive.ToString().ToLower())
            };

            // Jeśli użytkownik jest typu Podmiot, dodaj ID podmiotu do tokenu
            if (user.Rola == RolaUzytkownika.Podmiot && user.PodmiotId.HasValue)
            {
                claims.Add(new Claim("podmiotId", user.PodmiotId.Value.ToString()));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiration = DateTime.Now.AddHours(8); // Token ważny 8 godzin

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expiration,
                signingCredentials: creds
            );

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