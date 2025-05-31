using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public enum SubscriptionType
{
    Fitness = 0,
    Pilates = 1,
    Yoga = 2,
    CrossFit = 3,
    Swimming = 4,
    PersonalTraining = 5,
    Cardio = 7,
}

public class Subscriptions
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }

    [Required(ErrorMessage = "Subscription type is required")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public SubscriptionType Type { get; set; }

    [Required(ErrorMessage = "Price is required")]
    [Range(0, int.MaxValue, ErrorMessage = "Price must be a positive number")]
    public int Price { get; set; }

    [Required(ErrorMessage = "Start date is required")]
    public DateTime StartDate { get; set; }

    [Required(ErrorMessage = "End date is required")]
    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; }
}