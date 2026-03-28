using Microsoft.EntityFrameworkCore;
using backend.db.Models;

namespace backend.db;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<Models.Task> Tasks => Set<Models.Task>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<WorkLog> WorkLogs => Set<WorkLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ── User ────────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");

            e.HasIndex(u => u.Email).IsUnique();

            e.Property(u => u.Email).HasMaxLength(150).IsRequired();
            e.Property(u => u.PasswordHash).HasMaxLength(255).IsRequired();
            e.Property(u => u.Role).HasMaxLength(20).IsRequired();
            e.Property(u => u.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ── Student ─────────────────────────────────────────────
        modelBuilder.Entity<Student>(e =>
        {
            e.ToTable("students");

            e.Property(s => s.FullName).HasMaxLength(150).IsRequired();
            e.Property(s => s.StudentNumber).HasMaxLength(50);
            e.Property(s => s.VolunteeringCourse).HasDefaultValue(false);
            e.Property(s => s.TotalHours).HasPrecision(7, 2).HasDefaultValue(0m);

            e.HasOne(s => s.User)
             .WithOne(u => u.Student)
             .HasForeignKey<Student>(s => s.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(s => s.UserId).IsUnique();
        });

        // ── Organization ────────────────────────────────────────
        modelBuilder.Entity<Organization>(e =>
        {
            e.ToTable("organizations");

            e.Property(o => o.Name).HasMaxLength(200).IsRequired();
            e.Property(o => o.ContactPhone).HasMaxLength(30);

            e.HasOne(o => o.User)
             .WithOne(u => u.Organization)
             .HasForeignKey<Organization>(o => o.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(o => o.UserId).IsUnique();
        });

        // ── Task ────────────────────────────────────────────────
        modelBuilder.Entity<Models.Task>(e =>
        {
            e.ToTable("tasks");

            e.Property(t => t.Title).HasMaxLength(200).IsRequired();
            e.Property(t => t.Description).IsRequired();
            e.Property(t => t.Status).HasMaxLength(20).HasDefaultValue("open");
            e.Property(t => t.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            e.HasOne(t => t.Organization)
             .WithMany(o => o.Tasks)
             .HasForeignKey(t => t.OrgId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Application ─────────────────────────────────────────
        modelBuilder.Entity<Application>(e =>
        {
            e.ToTable("applications");

            e.Property(a => a.Status).HasMaxLength(20).HasDefaultValue("pending");
            e.Property(a => a.AppliedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            e.HasOne(a => a.Task)
             .WithMany(t => t.Applications)
             .HasForeignKey(a => a.TaskId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(a => a.Student)
             .WithMany(s => s.Applications)
             .HasForeignKey(a => a.StudentId)
             .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint: one application per student per task
            e.HasIndex(a => new { a.TaskId, a.StudentId }).IsUnique();
        });

        // ── WorkLog ─────────────────────────────────────────────
        modelBuilder.Entity<WorkLog>(e =>
        {
            e.ToTable("work_logs");

            e.Property(w => w.HoursWorked).HasPrecision(5, 2);
            e.Property(w => w.LoggedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            e.HasOne(w => w.Application)
             .WithMany(a => a.WorkLogs)
             .HasForeignKey(w => w.ApplicationId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
