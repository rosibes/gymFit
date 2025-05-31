using log4net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("odata/[controller]")]
public class SubscriptionsController : ControllerBase
{
    private readonly GymFitContext _context;
    private readonly ILog _logger;

    public SubscriptionsController(GymFitContext context)
    {
        _context = context;
        _logger = LogManager.GetLogger(typeof(SubscriptionsController));
    }
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Subscriptions>>> GetSubscriptions()
    {
        _logger.Info("Getting all subscriptions");
        return await _context.Subscriptions
            .Include(a => a.User)
            .ToListAsync();
    }
    [HttpPost]
    public async Task<ActionResult<Subscriptions>> CreateSubscription([FromBody] SubscriptionCreateDTO subscriptionDto)
    {
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
}


