
using System.ComponentModel.DataAnnotations;

public class SubscriptionPlan
{
    public int Id { get; set; }
    [Required(ErrorMessage = "Name is required")]
    public string Name { get; set; }
    [Required(ErrorMessage = "Description is required")]
    public string Description { get; set; }
    [Required(ErrorMessage = "Price is required")]
    public decimal Price { get; set; }
    [Required(ErrorMessage = "DurationInDays is required")]
    public int DurationInDays { get; set; }
    [Required(ErrorMessage = "Type is required")]
    public SubscriptionType Type { get; set; }
}