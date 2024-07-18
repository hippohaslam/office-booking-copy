namespace Hippo.Booking.Application.Queries.Scheduling;

public class ScheduledTaskResponse
{
    public string Task { get; set; } = string.Empty;

    public string CronExpression { get; set; } = string.Empty;
}