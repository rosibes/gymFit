using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using GymFit_BE.DTOs;
using log4net;


[ApiController]
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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Trainer>>> GetTrainers()
    {
        _logger.Info("Getting all trainers");
        return await _context.Trainers.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Trainer>> CreateTrainer([FromBody] TrainerCreateDto trainerDto)
    {
        try
        {
            _logger.Info($"Creating new trainer: {System.Text.Json.JsonSerializer.Serialize(trainerDto)}");
            // Verifică dacă User-ul există
            var user = await _context.Users.FindAsync(trainerDto.UserId);

            if (user == null)
            {
                _logger.Error($"User not found for trainer: {trainerDto.UserId}");
                return BadRequest("User not found");
            }

            if (user.UserRole != Role.Trainer)
            {
                _logger.Error($"User is not a trainer: {trainerDto.UserId}");
                return BadRequest("User is not a trainer");
            }

            if (await _context.Trainers.AnyAsync(t => t.UserId == trainerDto.UserId))
            {
                _logger.Error($"Trainer profile already exists for user: {trainerDto.UserId}");
                return BadRequest("Trainer profile already exists for this user");
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
            _logger.Info($"Trainer created successfully: {trainer.Id}");
            return trainer;

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
            .Include(t => t.User) // Include User-ul asociat
            .FirstOrDefaultAsync(t => t.Id == id);
        if (trainer == null) return NotFound();
        return trainer;
    }
}