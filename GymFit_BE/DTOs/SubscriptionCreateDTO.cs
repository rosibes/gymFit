using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class SubscriptionCreateDTO
{
    [Required(ErrorMessage = "User ID is required")]

    public int UserId { get; set; }


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
}