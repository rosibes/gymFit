using log4net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using GymFit_BE.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace GymFit_BE.Controllers
{
    [Route("odata/[controller]")]
    public class AuthController : ODataController
    {
        private readonly GymFitContext _context;
        private readonly ILog _logger;
        private readonly IConfiguration _configuration;

        public AuthController(GymFitContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            _logger = LogManager.GetLogger(typeof(AuthController));
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register([FromBody] RegisterDTO registerDto)
        {
            _logger.Info($"Înregistrare utilizator: {registerDto.Email}");
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                _logger.Error($"Email-ul {registerDto.Email} este deja înregistrat");
                return BadRequest("Email-ul este deja înregistrat");
            }

            var user = new User
            {
                Name = registerDto.Name,
                Email = registerDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password), // Hashuim parola aici
                PhoneNumber = registerDto.PhoneNumber,
                DateOfBirth = registerDto.DateOfBirth,
                UserRole = Role.User // Rol implicit pentru utilizatori noi

            };

            _context.Users.Add(user);
            _logger.Info($"Utilizatorul {registerDto.Email} a fost adaugat in baza de date");
            await _context.SaveChangesAsync();

            return Ok(new { message = "Înregistrare reușită" });
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login([FromBody] LoginDTO loginDto)
        {
            _logger.Info($"Login utilizator: {loginDto.Email}");
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null)
            {
                _logger.Error($"Utilizatorul nu a fost găsit: {loginDto.Email}");
                return Unauthorized("Email sau parolă incorectă");
            }

            _logger.Info($"Parola hash din baza de date: {user.Password}");
            _logger.Info($"Încercăm să verificăm parola pentru: {loginDto.Email}");

            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                _logger.Error($"Verificarea parolei a eșuat pentru: {loginDto.Email}");
                return Unauthorized("Email sau parolă incorectă");
            }

            var token = GenerateJwtToken(user);
            _logger.Info($"Token generat pentru utilizator: {loginDto.Email}");
            return Ok(new { token });
        }

        [Authorize] // Acest endpoint este protejat
        [HttpGet("me")]
        public async Task<ActionResult<User>> GetCurrentUser()
        {
            _logger.Info("Obținerea informațiilor utilizatorului curent");
            // Obținem ID-ul utilizatorului din token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                _logger.Error("Nu s-a putut obține ID-ul utilizatorului din token");
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                user.Id,
                user.Name,
                user.Email,
                user.PhoneNumber,
                user.DateOfBirth,
                user.UserRole
            });
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.UserRole.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: credentials
            );

            _logger.Info($"Token generat pentru utilizator: {user.Email}");

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}