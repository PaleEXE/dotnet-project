namespace backend.db.Models;

public class Organization
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? ContactPhone { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<Task> Tasks { get; set; } = new List<Task>();
}
