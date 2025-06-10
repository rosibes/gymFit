using log4net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[Route("odata/[controller]")]
[Authorize]
public class SubscriptionsController : ODataController
{
    private readonly GymFitContext _context;
    private readonly ILog _logger;

    public SubscriptionsController(GymFitContext context)
    {
        _context = context;
        _logger = LogManager.GetLogger(typeof(SubscriptionsController));
    }

    [EnableQuery]
    public IActionResult Get()
    {
        _logger.Info("Getting all subscriptions via OData");
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        // Verificăm dacă există un filtru pentru UserId
        var odataQuery = HttpContext.Request.Query["$filter"].ToString();
        if (odataQuery.Contains("UserId eq"))
        {
            // Extragem ID-ul utilizatorului din query
            var requestedUserId = int.Parse(odataQuery.Split("UserId eq ")[1].Split(" ")[0]);

            // Verificăm autorizarea
            if (requestedUserId != userId && userRole != "Admin")
            {
                _logger.Warn($"User {userId} attempted to access subscriptions for user {requestedUserId}");
                return Forbid();
            }
        }

        // Doar adminii pot vedea toate abonamentele
        if (userRole == "Admin")
        {
            _logger.Info(userRole);
            _logger.Info("Admin is viewing all subscriptions");
            return Ok(_context.Subscriptions
                .Include(a => a.User)
                .AsQueryable());
        }

        // Utilizatorii normali pot vedea doar propriile abonamente
        _logger.Info($"User {userId} is viewing their own subscriptions");
        return Ok(_context.Subscriptions
            .Include(a => a.User)
            .Where(s => s.UserId == userId)
            .AsQueryable());
    }

    [HttpPost]
    public async Task<ActionResult<Subscriptions>> CreateSubscription([FromBody] SubscriptionCreateDTO subscriptionDto)
    {
        _logger.Info($"Creating new subscription: {System.Text.Json.JsonSerializer.Serialize(subscriptionDto)}");
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        // Verificăm dacă utilizatorul încearcă să creeze un abonament pentru alt utilizator
        if (subscriptionDto.UserId != userId && userRole != "Admin")
        {
            _logger.Warn($"User {userId} attempted to create subscription for another user {subscriptionDto.UserId}");
            return Forbid();
        }

        _logger.Info($"Creating new subscription: {System.Text.Json.JsonSerializer.Serialize(subscriptionDto)}");
        var user = await _context.Users.FindAsync(subscriptionDto.UserId);
        if (user == null)
        {
            _logger.Warn($"User not found with ID: {subscriptionDto.UserId}");
            return BadRequest(new { error = "User not found", userId = subscriptionDto.UserId });
        }

        if (user.UserRole != Role.User)
        {
            _logger.Warn($"User with ID: {subscriptionDto.UserId} is not a Client. User role: {user.UserRole}");
            return BadRequest(new { error = "Invalid user role", message = "Only clients can have subscriptions", userRole = user.UserRole });
        }

        // Verificăm dacă utilizatorul are deja un abonament activ de același tip
        var existingSubscription = await _context.Subscriptions
            .AnyAsync(s => s.UserId == subscriptionDto.UserId
                       && s.Type == subscriptionDto.Type
                       && s.IsActive);

        if (existingSubscription)
        {
            _logger.Warn($"User {subscriptionDto.UserId} already has an active {subscriptionDto.Type} subscription");
            return BadRequest(new
            {
                error = "Duplicate subscription",
                message = $"User already has an active {subscriptionDto.Type} subscription",
                subscriptionType = subscriptionDto.Type
            });
        }

        var createDate = DateTime.SpecifyKind(subscriptionDto.StartDate, DateTimeKind.Utc);
        var currentDate = DateTime.UtcNow;

        if (createDate < currentDate.Date)
        {
            _logger.Warn($"Invalid subscription start date: {createDate}");
            return BadRequest(new
            {
                error = "Invalid subscription start date",
                message = "Subscription start date cannot be in the past",
                providedDate = createDate,
                currentDate = currentDate
            });
        }

        var endDate = DateTime.SpecifyKind(subscriptionDto.EndDate, DateTimeKind.Utc);
        if (endDate <= createDate)
        {
            _logger.Warn($"Invalid subscription end date: {endDate}");
            return BadRequest(new
            {
                error = "Invalid subscription end date",
                message = "Subscription end date must be after start date",
                startDate = createDate,
                endDate = endDate
            });
        }

        // Verificare dacă perioada abonamentului este validă (maxim 1 an)
        var maxDuration = TimeSpan.FromDays(365);
        if (endDate - createDate > maxDuration)
        {
            _logger.Warn($"Subscription duration too long: {endDate - createDate}");
            return BadRequest(new
            {
                error = "Invalid subscription duration",
                message = "Subscription cannot be longer than 1 year",
                duration = endDate - createDate,
                maxDuration = maxDuration
            });
        }

        // Calculăm IsActive bazat pe datele curente
        bool isActive = currentDate >= createDate && currentDate <= endDate;

        var subscription = new Subscriptions
        {
            UserId = subscriptionDto.UserId,
            Type = subscriptionDto.Type,
            Price = subscriptionDto.Price,
            StartDate = createDate,
            EndDate = endDate,
            IsActive = isActive
        };
        _context.Subscriptions.Add(subscription);
        await _context.SaveChangesAsync();
        _logger.Info($"Subscription created successfully with ID: {subscription.Id}");
        return subscription;
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<Subscriptions>> DeleteSubscription(int id)
    {
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userRole != "Admin")
        {
            _logger.Warn($"User {userRole} attempted to delete subscription with ID: {id}");
            return Forbid();
        }

        _logger.Info($"Deleting subscription with ID: {id}");
        var subscription = await _context.Subscriptions.FindAsync(id);
        if (subscription == null)
        {
            _logger.Warn($"Subscription not found with ID: {id}");
            return NotFound();
        }
        _context.Subscriptions.Remove(subscription);
        await _context.SaveChangesAsync();
        return Ok();
    }
}


