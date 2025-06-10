using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using GymFit_BE.DTOs;
using log4net;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.Authorization;
using GymFit_BE.Models;

[Route("odata/[controller]")]
public class TrainerController : ODataController
{
    private readonly GymFitContext _context;
    private readonly ILog _logger;

    public TrainerController(GymFitContext context)
    {
        _context = context;
        _logger = LogManager.GetLogger(typeof(TrainerController));
    }

    [EnableQuery]
    public IActionResult Get()
    {
        _logger.Info("Getting all trainers via OData");
        return Ok(_context.Trainers
            .Include(t => t.User)
            .Include(t => t.TimeSlots)
            .AsQueryable());
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Trainer>> CreateTrainer([FromBody] TrainerCreateDto trainerDto)
    {
        try
        {
            _logger.Info($"Creating new trainer: {System.Text.Json.JsonSerializer.Serialize(trainerDto)}");

            // Verificăm dacă utilizatorul există și are rolul de Trainer
            var user = await _context.Users.FindAsync(trainerDto.UserId);
            if (user == null)
            {
                _logger.Warn($"User not found with ID: {trainerDto.UserId}");
                return BadRequest(new { error = "User not found", userId = trainerDto.UserId });
            }

            if (user.UserRole != Role.Trainer)
            {
                _logger.Warn($"User with ID: {trainerDto.UserId} is not a Trainer. User role: {user.UserRole}");
                return BadRequest(new { error = "Invalid user role", message = "User must have Trainer role", userRole = user.UserRole });
            }

            // Verificăm dacă utilizatorul are deja un profil de trainer
            var existingTrainer = await _context.Trainers.AnyAsync(t => t.UserId == trainerDto.UserId);
            if (existingTrainer)
            {
                _logger.Warn($"Trainer profile already exists for user {trainerDto.UserId}");
                return BadRequest(new { error = "Trainer profile exists", message = "User already has a trainer profile" });
            }

            // Verificăm dacă specializarea se potrivește cu unul din tipurile de abonamente disponibile
            var validSpecializations = Enum.GetNames(typeof(SubscriptionType)).ToArray();
            if (!validSpecializations.Any(s => s.Equals(trainerDto.Specialization, StringComparison.OrdinalIgnoreCase)))
            {
                _logger.Warn($"Invalid specialization: {trainerDto.Specialization}");
                return BadRequest(new
                {
                    error = "Invalid specialization",
                    message = "Specialization must match one of the available subscription types",
                    validSpecializations = validSpecializations,
                    providedSpecialization = trainerDto.Specialization
                });
            }

            var trainer = new Trainer
            {
                UserId = trainerDto.UserId,
                Specialization = trainerDto.Specialization,
                Experience = trainerDto.Experience,
                Introduction = trainerDto.Introduction,
                Availability = trainerDto.Availability,
                Location = trainerDto.Location
            };

            _context.Trainers.Add(trainer);
            await _context.SaveChangesAsync();

            // Creăm sloturile pentru trainer
            var slots = new List<TimeSlot>();
            for (int hour = 9; hour <= 20; hour++)
            {
                slots.Add(new TimeSlot
                {
                    TrainerId = trainer.Id,
                    Hour = hour,
                    IsAvailable = true
                });
            }

            _context.TimeSlots.AddRange(slots);
            await _context.SaveChangesAsync();

            _logger.Info($"Trainer created successfully with ID: {trainer.Id} and {slots.Count} time slots");
            return CreatedAtAction(nameof(Get), new { id = trainer.Id }, trainer);
        }
        catch (Exception ex)
        {
            _logger.Error("Error creating trainer", ex);
            return BadRequest(new { error = "Failed to create trainer", message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Trainer>> GetTrainer(int id)
    {
        var trainer = await _context.Trainers
            .Include(t => t.User)
            .Include(t => t.TimeSlots)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (trainer == null) return NotFound();
        return Ok(trainer);
    }
}