using GymFit_BE.Models;
using log4net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.EntityFrameworkCore;

[Route("odata/[controller]")]
public class TimeSlotsController : ODataController
{
    private readonly GymFitContext _context;
    private readonly ILog _logger;

    public TimeSlotsController(GymFitContext context)
    {
        _context = context;
        _logger = LogManager.GetLogger(typeof(TimeSlotsController));
    }

    [EnableQuery]
    public IActionResult Get()
    {
        return Ok(_context.TimeSlots.AsQueryable());
    }

    [EnableQuery]
    [HttpGet("trainer/{trainerId}")]
    public async Task<ActionResult<IQueryable<TimeSlot>>> GetTrainerSlots(int trainerId)
    {
        var trainer = await _context.Trainers.FindAsync(trainerId);
        if (trainer == null)
        {
            return NotFound($"Trainer with ID {trainerId} not found");
        }

        var slots = _context.TimeSlots
            .Where(ts => ts.TrainerId == trainerId)
            .Select(ts => new
            {
                ts.Id,
                ts.TrainerId,
                ts.Hour,
                ts.IsAvailable,
                ts.AppointmentId
            });
        return Ok(slots);
    }

    [EnableQuery]
    [HttpGet("available/{trainerId}/{date}")]
    public async Task<ActionResult<IQueryable<TimeSlot>>> GetAvailableSlots(int trainerId, DateTime date)
    {
        try
        {
            var trainer = await _context.Trainers.FindAsync(trainerId);
            if (trainer == null)
            {
                _logger.Error($"Trainer with ID {trainerId} not found");
                return NotFound($"Trainer with ID {trainerId} not found");
            }

            // Convertim data în UTC
            var utcDate = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);

            if (utcDate.Date < DateTime.UtcNow.Date)
            {
                _logger.Error($"Cannot check availability for past dates");
                return BadRequest("Cannot check availability for past dates");
            }

            _logger.Info($"Getting available time slots for trainer {trainerId} on {utcDate}");

            // Obținem toate programările pentru trainer în ziua respectivă
            var appointments = await _context.Appointments
                .Include(a => a.TimeSlot)
                .Where(a => a.TrainerId == trainerId && a.Date.Date == utcDate.Date && a.Status != "Cancelled")
                .ToListAsync();

            // Creăm o listă cu toate orele posibile (9:00-17:00)
            var allHours = Enumerable.Range(9, 9).ToList(); // 9:00 - 17:00

            // Obținem orele ocupate
            var occupiedHours = appointments.Select(a => a.TimeSlot.Hour).ToList();

            // Returnăm doar orele disponibile
            var availableHours = allHours.Where(h => !occupiedHours.Contains(h)).ToList();

            // Creăm sloturi de timp pentru orele disponibile
            var availableSlots = availableHours.Select(hour => new TimeSlot
            {
                TrainerId = trainerId,
                Hour = hour,
                IsAvailable = true
            });

            return Ok(availableSlots);
        }
        catch (Exception ex)
        {
            _logger.Error($"Error getting available time slots: {ex.Message}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("check/{trainerId}/{date}/{hour}")]
    public async Task<ActionResult<bool>> CheckSlotAvailability(int trainerId, DateTime date, int hour)
    {
        try
        {
            if (hour < 9 || hour > 20)
            {
                _logger.Error($"Hour must be between 9 and 20");
                return BadRequest("Hour must be between 9 and 20");
            }

            // Convertim data în UTC
            var utcDate = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);

            if (utcDate.Date < DateTime.UtcNow.Date)
            {
                _logger.Error($"Cannot check availability for past dates");
                return BadRequest("Cannot check availability for past dates");
            }

            var trainer = await _context.Trainers.FindAsync(trainerId);
            if (trainer == null)
            {
                _logger.Error($"Trainer with ID {trainerId} not found");
                return NotFound($"Trainer with ID {trainerId} not found");
            }

            var isAvailable = await _context.TimeSlots
                .AnyAsync(ts => ts.TrainerId == trainerId &&
                               ts.Hour == hour &&
                               ts.IsAvailable &&
                               !_context.Appointments.Any(a =>
                                   a.TimeSlotId == ts.Id &&
                                   a.Date.Date == utcDate.Date));
            return Ok(isAvailable);
        }
        catch (Exception ex)
        {
            _logger.Error($"Error checking slot availability: {ex.Message}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TimeSlot>> UpdateTimeSlot(int id, TimeSlot timeSlot)
    {
        if (id != timeSlot.Id)
        {
            return BadRequest("ID mismatch");
        }

        try
        {
            if (timeSlot.Hour < 9 || timeSlot.Hour > 20)
            {
                _logger.Error($"Hour must be between 9 and 20");
                return BadRequest("Hour must be between 9 and 20");
            }

            var existingSlot = await _context.TimeSlots.FindAsync(id);
            if (existingSlot == null)
            {
                _logger.Error($"TimeSlot with ID {id} not found");
                return NotFound($"TimeSlot with ID {id} not found");
            }

            _context.TimeSlots.Update(timeSlot);
            await _context.SaveChangesAsync();
            _logger.Info($"Updated time slot {id}");
            return Ok(timeSlot);
        }
        catch (Exception ex)
        {
            _logger.Error($"Error updating time slot {id}: {ex.Message}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTimeSlot(int id)
    {
        try
        {
            var timeSlot = await _context.TimeSlots.FindAsync(id);
            if (timeSlot == null)
            {
                _logger.Error($"TimeSlot with ID {id} not found");
                return NotFound($"TimeSlot with ID {id} not found");
            }

            if (_context.Appointments.Any(a => a.TimeSlotId == id))
            {
                _logger.Error($"Cannot delete time slot {id} that has associated appointments");
                return BadRequest("Cannot delete time slot that has associated appointments");
            }

            _context.TimeSlots.Remove(timeSlot);
            await _context.SaveChangesAsync();
            _logger.Info($"Deleted time slot {id}");
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.Error($"Error deleting time slot {id}: {ex.Message}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // Endpoint temporar pentru a crea sloturi pentru trainerii existenți
    [HttpPost("create-slots-for-trainer/{trainerId}")]
    public async Task<ActionResult<List<TimeSlot>>> CreateSlotsForExistingTrainer(int trainerId)
    {
        try
        {
            var trainer = await _context.Trainers.FindAsync(trainerId);
            if (trainer == null)
            {
                return NotFound($"Trainer with ID {trainerId} not found");
            }

            // Verificăm dacă trainer-ul are deja sloturi
            var existingSlots = await _context.TimeSlots
                .Where(ts => ts.TrainerId == trainerId)
                .AnyAsync();

            if (existingSlots)
            {
                return BadRequest($"Trainer {trainerId} already has time slots");
            }

            // Creăm sloturile pentru trainer
            var slots = new List<TimeSlot>();
            for (int hour = 9; hour <= 20; hour++)
            {
                slots.Add(new TimeSlot
                {
                    TrainerId = trainerId,
                    Hour = hour,
                    IsAvailable = true
                });
            }

            _context.TimeSlots.AddRange(slots);
            await _context.SaveChangesAsync();

            _logger.Info($"Created {slots.Count} time slots for existing trainer {trainerId}");
            return Ok(slots);
        }
        catch (Exception ex)
        {
            _logger.Error($"Error creating slots for trainer {trainerId}: {ex.Message}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}