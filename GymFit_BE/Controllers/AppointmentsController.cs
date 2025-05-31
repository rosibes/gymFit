using GymFit_BE.DTOs;
using log4net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("odata/[controller]")]

public class AppointmentsController : ControllerBase
{
    private readonly GymFitContext _context;
    private readonly ILog _logger;

    public AppointmentsController(GymFitContext context)
    {
        _context = context;
        _logger = LogManager.GetLogger(typeof(AppointmentsController));
    }

    [HttpPost]
    public async Task<ActionResult<Appointments>> CreateAppointment([FromBody] AppointmentCreateDto appointmentDto)
    {
        try
        {
            _logger.Info($"Creating new appointment: {System.Text.Json.JsonSerializer.Serialize(appointmentDto)}");
            var user = await _context.Users.FindAsync(appointmentDto.UserId);
            if (user == null)
            {
                _logger.Warn($"User not found with ID: {appointmentDto.UserId}");
                return BadRequest(new { error = "User not found", userId = appointmentDto.UserId });
            }

            var trainer = await _context.Trainers.FindAsync(appointmentDto.TrainerId);
            if (trainer == null)
            {
                _logger.Warn($"Trainer not found with ID: {appointmentDto.TrainerId}");
                return BadRequest(new { error = "Trainer not found", trainerId = appointmentDto.TrainerId });
            }

            // Convert the date to UTC
            var appointmentDate = DateTime.SpecifyKind(appointmentDto.Date, DateTimeKind.Utc);
            var currentDate = DateTime.UtcNow;

            if (appointmentDate <= currentDate)
            {
                _logger.Warn($"Invalid appointment date: {appointmentDate}");
                return BadRequest(new
                {
                    error = "Invalid appointment date",
                    message = "Appointment date must be in the future",

                });
            }

            //  Verificare suprapunere programări
            var hasOverlap = await _context.Appointments
                .AnyAsync(a => a.TrainerId == appointmentDto.TrainerId
                           && a.Date == appointmentDate
                           && a.Status != "Cancelled");

            if (hasOverlap)
            {
                _logger.Warn($"Overlapping appointment found for trainer {appointmentDto.TrainerId} at {appointmentDate}");
                return BadRequest(new
                {
                    error = "Overlapping appointment",
                    message = "Trainer already has an appointment at this time",
                    date = appointmentDate
                });
            }

            var validStatuses = new[] { "Pending", "Confirmed", "Cancelled", "Completed" };
            if (!validStatuses.Contains(appointmentDto.Status))
            {
                _logger.Warn($"Invalid appointment status: {appointmentDto.Status}");
                return BadRequest(new
                {
                    error = "Invalid status",
                    message = "Status must be one of: " + string.Join(", ", validStatuses),
                    providedStatus = appointmentDto.Status
                });
            }

            var appointment = new Appointments
            {
                UserId = appointmentDto.UserId,
                TrainerId = appointmentDto.TrainerId,
                Date = appointmentDate,
                Status = appointmentDto.Status
            };
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            _logger.Info($"Appointment created successfully with ID: {appointment.Id}");
            return appointment;
        }
        catch (Exception ex)
        {
            _logger.Error("Error creating appointment", ex);
            return BadRequest(new { error = "Failed to create appointment", message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Appointments>>> GetAppointments()
    {
        _logger.Info("Getting all appointments");
        return await _context.Appointments
            .Include(a => a.User)
            .Include(a => a.Trainer)
            .ToListAsync();
    }
}