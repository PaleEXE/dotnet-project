namespace backend.db.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Role { get; set; } = null!;          // "student" | "organization"
    public DateTime CreatedAt { get; set; }

    // Navigation
    public Student? Student { get; set; }
    public Organization? Organization { get; set; }
}
