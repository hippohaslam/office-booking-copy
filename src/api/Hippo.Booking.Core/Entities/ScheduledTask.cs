namespace Hippo.Booking.Core.Entities;

public class ScheduledTask : BaseEntity<int>
{
    public string Task { get; set; } = string.Empty;

    public DateOnly LastRunDate { get; set; }
    
    public TimeOnly TimeToRun { get; set; }
    
    public string PayloadJson { get; set; } = "{}";
}