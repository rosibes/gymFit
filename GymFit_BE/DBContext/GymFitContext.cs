using Microsoft.EntityFrameworkCore;
using GymFit_BE.Models;

public class GymFitContext : DbContext
{
    public GymFitContext(DbContextOptions<GymFitContext> options) : base(options) { }
    public DbSet<User> Users { get; set; }

    public DbSet<Trainer> Trainers { get; set; }

    public DbSet<Appointments> Appointments { get; set; }

    public DbSet<Subscriptions> Subscriptions { get; set; }

    public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
    public DbSet<TimeSlot> TimeSlots { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Trainer>()
            .HasOne(t => t.User)
            .WithOne()
            .HasForeignKey<Trainer>(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Trainer>()
            .HasIndex(t => t.UserId)
            .IsUnique(); // Un User poate fi asociat cu un singur Trainer

        modelBuilder.Entity<Appointments>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Appointments>()
            .HasOne(a => a.Trainer) // Specifică că o înregistrare Appointments are un singur Trainer
            .WithMany() // Specifică că un Trainer poate avea multe Appointments
            .HasForeignKey(a => a.TrainerId) // Specifică că TrainerId din Appointments este cheia străină
            .OnDelete(DeleteBehavior.Cascade); // Specifică că dacă un Trainer este șters, toate Appointments-urile sale vor fi șterse

        modelBuilder.Entity<Subscriptions>()
            .HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Trainer>()
               .HasMany(t => t.TimeSlots)
               .WithOne(ts => ts.Trainer)
               .HasForeignKey(ts => ts.TrainerId)
               .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TimeSlot>()
            .HasOne(ts => ts.Appointment)
            .WithOne(a => a.TimeSlot)
            .HasForeignKey<TimeSlot>(ts => ts.AppointmentId)
            .OnDelete(DeleteBehavior.SetNull); // Schimbăm în SetNull pentru a nu șterge slotul când se șterge programarea
    }

}