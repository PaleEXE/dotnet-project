namespace backend.db.Models;

public class Task
{
    public int Id { get; set; }
    public int OrgId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int? VolunteersNeeded { get; set; }
    public string Status { get; set; } = null!;        // "open" | "in_progress" | "completed" | "cancelled"
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public Organization Organization { get; set; } = null!;
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}
