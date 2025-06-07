using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GymFit_BE.Models
{
    public class TimeSlot
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Trainer is required")]
        public int TrainerId { get; set; }

        [Required(ErrorMessage = "Trainer is required")]
        public Trainer Trainer { get; set; }


        [Required(ErrorMessage = "Hour is required")]
        public int Hour { get; set; }  // 9-20

        [Required(ErrorMessage = "IsAvailable is required")]
        public bool IsAvailable { get; set; } = true;

        public int? AppointmentId { get; set; }

        public Appointments? Appointment { get; set; }
    }
}