using System.ComponentModel.DataAnnotations;

namespace GymFit_BE.DTOs
{
    public class RegisterDTO
    {
        [Required(ErrorMessage = "Numele este obligatoriu")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Numele trebuie să aibă între 2 și 100 de caractere")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email-ul este obligatoriu")]
        [EmailAddress(ErrorMessage = "Format email invalid")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Parola este obligatorie")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Parola trebuie să aibă cel puțin 6 caractere")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Numărul de telefon este obligatoriu")]
        [StringLength(100, MinimumLength = 9, ErrorMessage = "Numărul de telefon trebuie să aibă cel puțin 9 caractere")]
        public string PhoneNumber { get; set; }

        [Required(ErrorMessage = "Data nașterii este obligatorie")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateOnly DateOfBirth { get; set; }
    }
}