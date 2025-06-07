using log4net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.EntityFrameworkCore;

[Route("odata/[controller]")]

public class SubscriptionPlansController : ODataController
{
    private readonly GymFitContext _context;
    private readonly ILog _logger;

    public SubscriptionPlansController(GymFitContext context)
    {
        _context = context;
        _logger = LogManager.GetLogger(typeof(SubscriptionPlansController));
    }

    [EnableQuery]
    public IActionResult Get()
    {
        _logger.Info("Getting all subscription plans via OData");
        return Ok(_context.SubscriptionPlans.AsQueryable());
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<SubscriptionPlan>> CreateSubscriptionPlan([FromBody] SubscriptionPlanDTO subscriptionPlanDto)
    {
        _logger.Info($"Creating new subscription plan: {System.Text.Json.JsonSerializer.Serialize(subscriptionPlanDto)}");

        var existingSubscriptionPlan = await _context.SubscriptionPlans.FirstOrDefaultAsync(sp => sp.Name == subscriptionPlanDto.Name);
        if (existingSubscriptionPlan != null)
        {
            _logger.Error($"Subscription plan with name {subscriptionPlanDto.Name} already exists");
            return BadRequest("Subscription plan with this name already exists");
        }

        if (subscriptionPlanDto.Price <= 0)
        {
            _logger.Error($"Invalid price for subscription plan: {subscriptionPlanDto.Price}");
            return BadRequest("Price must be greater than 0");
        }

        if (subscriptionPlanDto.DurationInDays <= 0)
        {
            _logger.Error($"Invalid duration for subscription plan: {subscriptionPlanDto.DurationInDays}");
            return BadRequest("Duration must be greater than 0");
        }

        SubscriptionType[] validTypes = {
            SubscriptionType.Fitness,
            SubscriptionType.Pilates,
            SubscriptionType.Yoga,
            SubscriptionType.CrossFit,
            SubscriptionType.Swimming,
            SubscriptionType.PersonalTraining,
            SubscriptionType.Cardio
        };

        if (!validTypes.Contains(subscriptionPlanDto.Type))
        {
            _logger.Error($"Invalid subscription type: {subscriptionPlanDto.Type}");
            return BadRequest("Invalid subscription type");
        }

        var subscriptionPlan = new SubscriptionPlan
        {
            Name = subscriptionPlanDto.Name,
            Description = subscriptionPlanDto.Description,
            Price = subscriptionPlanDto.Price,
            DurationInDays = subscriptionPlanDto.DurationInDays,
            Type = subscriptionPlanDto.Type,
        };

        _context.SubscriptionPlans.Add(subscriptionPlan);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = subscriptionPlan.Id }, subscriptionPlan);
    }
}