namespace GymFit_BE.DTOs;

public class TrainerCreateDto
{
    public int UserId { get; set; }
    public string Specialization { get; set; }
    public string Experience { get; set; }
    public string Introduction { get; set; }
    public string Availability { get; set; }
    public string Location { get; set; }
}