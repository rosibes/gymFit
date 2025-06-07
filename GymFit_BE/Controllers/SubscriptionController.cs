using log4net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;

[Route("odata/[controller]")]

public class SubscriptionPlanController : ODataController
{
    private readonly GymFitContext _context;
    private readonly ILog _logger;

    public SubscriptionPlanController(GymFitContext context)
    {
        _context = context;
        _logger = LogManager.GetLogger(typeof(SubscriptionPlanController));
    }

    [EnableQuery]
    public IQueryable<SubscriptionPlan> Get()
    {
        _logger.Info("Getting all subscription plans via OData");
        return _context.SubscriptionPlans;
    }
}