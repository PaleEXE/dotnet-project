namespace backend.db.Models;

public class Application
{
    public int Id { get; set; }
    public int TaskId { get; set; }
    public int StudentId { get; set; }
    public string Status { get; set; } = null!;         // "pending" | "accepted" | "rejected"
    public DateTime AppliedAt { get; set; }

    // Navigation
    public Task Task { get; set; } = null!;
    public Student Student { get; set; } = null!;
    public ICollection<WorkLog> WorkLogs { get; set; } = new List<WorkLog>();
}
