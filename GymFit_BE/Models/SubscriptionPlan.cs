
public class SubscriptionPlan
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int DurationInDays { get; set; }
    public SubscriptionType Type { get; set; }
    public bool IsActive { get; set; }
}