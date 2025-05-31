using System.ComponentModel.DataAnnotations;


public class Appointments
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }
    public int TrainerId { get; set; }
    public Trainer Trainer { get; set; }
    [Required(ErrorMessage = "Date is required")]
    public DateTime Date { get; set; }
    [Required(ErrorMessage = "Status is required")]
    [StringLength(20, ErrorMessage = "Status cannot be longer than 20 characters")]
    public string Status { get; set; }


}