using System.ComponentModel.DataAnnotations;
using GymFit_BE.Models;

public class Trainer
{
    public int Id { get; set; }
    [Required(ErrorMessage = "User is required")]
    public int UserId { get; set; }

    [Required(ErrorMessage = "User is required")]
    public User User { get; set; }

    [Required(ErrorMessage = "Specialization is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Specialization must be between 2 and 100 characters")]
    public string Specialization { get; set; }

    [Required(ErrorMessage = "Experience is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Experience must be between 2 and 100 characters")]
    public string Experience { get; set; }

    [Required(ErrorMessage = "Introduction is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Introduction must be between 2 and 100 characters")]
    public string Introduction { get; set; }

    [Required(ErrorMessage = "Availability is required")]
    [RegularExpression(@"^([A-Za-z]+:\s*[0-9]{1,2}:[0-9]{2}\s*-\s*[0-9]{1,2}:[0-9]{2}\s*,\s*)*([A-Za-z]+:\s*[0-9]{1,2}:[0-9]{2}\s*-\s*[0-9]{1,2}:[0-9]{2})$",
        ErrorMessage = "Availability must be in format 'Day: HH:MM-HH:MM, Day: HH:MM-HH:MM'")]
    public string Availability { get; set; }

    [Required(ErrorMessage = "Location is required")]
    public string Location { get; set; }

    [Required(ErrorMessage = "TimeSlots is required")]
    public ICollection<TimeSlot> TimeSlots { get; set; }

}
