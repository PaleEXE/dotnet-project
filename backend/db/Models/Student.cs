namespace backend.db.Models;

public class Student
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = null!;
    public string? StudentNumber { get; set; }
    public bool VolunteeringCourse { get; set; }
    public decimal TotalHours { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}
