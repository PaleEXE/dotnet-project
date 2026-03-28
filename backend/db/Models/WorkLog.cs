namespace backend.db.Models;

public class WorkLog
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public decimal HoursWorked { get; set; }
    public DateTime WorkDate { get; set; }
    public string? Notes { get; set; }
    public DateTime LoggedAt { get; set; }

    // Navigation
    public Application Application { get; set; } = null!;
}
