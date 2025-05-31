using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.EntityFrameworkCore;
using log4net;

[ApiController]
[Route("odata/[controller]")]
[EnableQuery]
public class UserController : ODataController
{
    private readonly GymFitContext _context;
    private readonly ILog _logger;

    public UserController(GymFitContext context)
    {
        _context = context;
        _logger = LogManager.GetLogger(typeof(UserController));
    }

    [HttpGet]
    public IQueryable<User> GetUsers()
    {
        _logger.Info("Getting all users");
        return _context.Users;
    }

    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
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

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.Info($"User created successfully with ID: {user.Id}");
            return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
        }
        catch (Exception ex)
        {
            _logger.Error("Error creating user", ex);
            return BadRequest(new { error = "Failed to create user", message = ex.Message });
        }
    }
}
