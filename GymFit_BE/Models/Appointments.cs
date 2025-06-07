using System.ComponentModel.DataAnnotations;
using GymFit_BE.Models;

public class Appointments
{
    public int Id { get; set; }
    [Required(ErrorMessage = "User is required")]
    public int UserId { get; set; }
    public User User { get; set; }
    [Required(ErrorMessage = "Trainer is required")]
    public int TrainerId { get; set; }
    public Trainer Trainer { get; set; }
    [Required(ErrorMessage = "Date is required")]
    public DateTime Date { get; set; }
    [Required(ErrorMessage = "TimeSlot is required")]
    public int TimeSlotId { get; set; }
    public TimeSlot TimeSlot { get; set; }
    [Required(ErrorMessage = "Status is required")]
    [StringLength(20, ErrorMessage = "Status cannot be longer than 20 characters")]
    public string Status { get; set; }




}