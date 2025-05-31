using System.ComponentModel.DataAnnotations;

namespace GymFit_BE.DTOs;

public class AppointmentCreateDto
{
    [Required]
    public int UserId { get; set; }

    [Required]
    public int TrainerId { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Pending";
}
