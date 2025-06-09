using GymFit_BE.DTOs;
using GymFit_BE.Models;
using log4net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace GymFit_BE.Controllers
{
    [Route("odata/[controller]")]
    [Authorize]

    public class AppointmentsController : ODataController
    {
        private readonly GymFitContext _context;
        private readonly ILog _logger;

        public AppointmentsController(GymFitContext context)
        {
            _context = context;
            _logger = LogManager.GetLogger(typeof(AppointmentsController));
        }

        [EnableQuery]
        public IActionResult Get()
        {
            _logger.Info("Getting all appointments via OData");
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            _logger.Info($"User {userId} with role {userRole} is viewing appointments");

            // Verificăm dacă există un filtru pentru UserId
            var odataQuery = HttpContext.Request.Query["$filter"].ToString();
            _logger.Info($"OData query: {odataQuery}");

            if (odataQuery.Contains("UserId eq"))
            {
                // Extragem ID-ul utilizatorului din query
                var requestedUserId = int.Parse(odataQuery.Split("UserId eq ")[1].Split(" ")[0]);

                // Verificăm autorizarea
                if (requestedUserId != userId && userRole != "Admin")
                {
                    _logger.Warn($"User {userId} attempted to access appointments for user {requestedUserId}");
                    return Forbid();
                }
            }

            if (userRole == "Admin")
            {
                _logger.Info("Getting all appointments for admin");
                return Ok(_context.Appointments
                    .Include(a => a.User)
                    .Include(a => a.Trainer)
                    .Include(a => a.Trainer.User)
                    .Include(a => a.TimeSlot)
                    .AsQueryable());
            }
            else if (userRole == "Trainer")
            {
                _logger.Info($"Trainer with userID{userId} is viewing their appointments");

                // Verificăm dacă trainerul există
                var trainer = _context.Trainers.FirstOrDefault(t => t.UserId == userId);
                if (trainer == null)
                {
                    _logger.Error($"Trainer not found for user {userId}");
                    return NotFound(new { error = "Trainer not found" });
                }

                _logger.Info($"Found trainer with ID {trainer.Id} for user {userId}");

                var trainerAppointments = _context.Appointments
                    .Include(a => a.User)
                    .Include(a => a.Trainer)
                    .Include(a => a.Trainer.User)
                    .Include(a => a.TimeSlot)
                    .Where(a => a.TrainerId == trainer.Id)
                    .AsQueryable();

                _logger.Info($"Found {trainerAppointments.Count()} appointments for trainer {trainer.Id}");
                return Ok(trainerAppointments);
            }
            else
            {
                _logger.Info($"User {userId} is viewing their own appointments");
                return Ok(_context.Appointments
                    .Include(a => a.User)
                    .Include(a => a.Trainer)
                    .Include(a => a.Trainer.User)
                    .Include(a => a.TimeSlot)
                    .Where(a => a.UserId == userId)
                    .AsQueryable());
            }
        }

        [HttpPost("new")]
        public async Task<ActionResult<Appointments>> CreateAppointment([FromBody] AppointmentCreateDto appointmentDto)
        {
            try
            {
                _logger.Info($"Creating new appointment: {System.Text.Json.JsonSerializer.Serialize(appointmentDto)}");
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                // Verificăm dacă utilizatorul încearcă să creeze un appointment pentru alt utilizator
                if (appointmentDto.UserId != userId && userRole != "Admin")
                {
                    _logger.Warn($"User {userId} attempted to create appointment for another user {appointmentDto.UserId}");
                    return Forbid();
                }

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
                        message = "Appointment date must be in the future"
                    });
                }

                // Verificăm dacă există deja o programare pentru această oră în aceeași zi
                var existingAppointment = await _context.Appointments
                    .Include(a => a.TimeSlot)
                    .Where(a => a.TrainerId == appointmentDto.TrainerId
                            && a.Date.Date == appointmentDate.Date
                            && a.TimeSlot.Hour == appointmentDto.Hour
                            && a.Status != "Cancelled")
                    .FirstOrDefaultAsync();

                if (existingAppointment != null)
                {
                    _logger.Warn($"Overlapping appointment found for trainer {appointmentDto.TrainerId} at {appointmentDate} hour {appointmentDto.Hour}");
                    return BadRequest(new
                    {
                        error = "Overlapping appointment",
                        message = "Trainer already has an appointment at this time",
                        date = appointmentDate,
                        hour = appointmentDto.Hour
                    });
                }

                // Creăm un nou slot de timp pentru această programare
                var timeSlot = new TimeSlot
                {
                    TrainerId = appointmentDto.TrainerId,
                    Hour = appointmentDto.Hour,
                    IsAvailable = false
                };
                _context.TimeSlots.Add(timeSlot);
                await _context.SaveChangesAsync();

                var appointment = new Appointments
                {
                    UserId = appointmentDto.UserId,
                    TrainerId = appointmentDto.TrainerId,
                    Date = appointmentDate,
                    Status = appointmentDto.Status,
                    TimeSlotId = timeSlot.Id
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                // Actualizăm slotul de timp cu ID-ul programării
                timeSlot.AppointmentId = appointment.Id;
                await _context.SaveChangesAsync();

                _logger.Info($"Appointment created successfully with ID: {appointment.Id}");
                return Ok(appointment);
            }
            catch (Exception ex)
            {
                _logger.Error("Error creating appointment", ex);
                return BadRequest(new { error = "Failed to create appointment", message = ex.Message });
            }
        }


        [HttpPut("{id}")]
        public async Task<ActionResult<Appointments>> UpdateAppointment(int id, [FromBody] AppointmentUpdateDto appointmentDto)
        {
            try
            {
                _logger.Info($"Creating new subscription: {System.Text.Json.JsonSerializer.Serialize(appointmentDto)}");
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var trainer = _context.Trainers.FirstOrDefault(t => t.UserId == userId);

                var appointment = await _context.Appointments.FindAsync(id);
                if (appointment == null)
                {
                    _logger.Warn($"Appointment not found with ID: {id}");
                    return NotFound();
                }

                // Verificăm dacă utilizatorul are dreptul să modifice programarea
                if (appointment.UserId != userId && userRole != "Admin" && appointment.TrainerId != trainer.Id)
                {
                    _logger.Warn($"User {userId} attempted to update appointment {id} for another user {appointment.UserId}");
                    return Forbid();
                }

                var validStatuses = new[] { "Pending", "Confirmed", "Cancelled", "Completed" };
                if (!validStatuses.Contains(appointmentDto.Status))
                {
                    _logger.Warn($"Invalid status: {appointmentDto.Status}");
                    return BadRequest(new { error = "Invalid status", message = "Status must be one of: " + string.Join(", ", validStatuses) });
                }

                appointment.Status = appointmentDto.Status;
                await _context.SaveChangesAsync();
                _logger.Info($"Appointment {id} updated successfully with status: {appointmentDto.Status}");
                return Ok(appointment);

            }
            catch (Exception ex)
            {
                _logger.Error($"Error updating appointment {id}", ex);
                return BadRequest(new { error = "Failed to update appointment", message = ex.Message });
            }
        }

    }
}