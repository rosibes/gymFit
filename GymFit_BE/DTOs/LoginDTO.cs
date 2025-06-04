using System.ComponentModel.DataAnnotations;

namespace GymFit_BE.DTOs
{
    public class LoginDTO
    {
        [Required(ErrorMessage = "Email-ul este obligatoriu")]
        [EmailAddress(ErrorMessage = "Format email invalid")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Parola este obligatorie")]
        public string Password { get; set; }
    }
}