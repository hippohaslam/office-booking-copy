namespace Hippo.Booking.Core.Entities;

public class ScheduledTask : BaseEntity<int>
{
    public string Task { get; set; } = string.Empty;

    public string CronExpression { get; set; } = string.Empty;

    public string TimeZoneId { get; set; } = string.Empty;

    public string PayloadJson { get; set; } = "{}";
}