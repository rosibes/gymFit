using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.EntityFrameworkCore;
using log4net;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[Route("odata/[controller]")]
[Authorize]
public class UserController : ODataController
{
    private readonly GymFitContext _context;
    private readonly ILog _logger;

    public UserController(GymFitContext context)
    {
        _context = context;
        _logger = LogManager.GetLogger(typeof(UserController));
    }

    [EnableQuery]
    public IActionResult Get()
    {
        _logger.Info("Getting all users via OData");
        return Ok(_context.Users.AsQueryable());
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<User>> CreateUser([FromBody] User user)
    {
        try
        {
            _logger.Info($"Creating new user: {System.Text.Json.JsonSerializer.Serialize(user)}");

            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
            {
                _logger.Warn($"Email already exists: {user.Email}");
                return BadRequest(new { error = "Email already exists", email = user.Email });
            }

            // Validate model
            if (!ModelState.IsValid)
            {
                _logger.Warn($"Invalid user data: {string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))}");
                return BadRequest(new { error = "Invalid user data", details = ModelState });
            }

            // Hash the password
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.Info($"User created successfully with ID: {user.Id}");
            return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
        }
        catch (Exception ex)
        {
            _logger.Error("Error creating user", ex);
            return BadRequest(new { error = "Failed to create user", message = ex.Message });
        }
    }
}
