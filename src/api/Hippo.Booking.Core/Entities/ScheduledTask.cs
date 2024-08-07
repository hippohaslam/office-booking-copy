namespace Hippo.Booking.Core.Entities;

public class ScheduledTask
{
    public string Task { get; set; } = string.Empty;

    public string CronExpression { get; set; } = string.Empty;
}