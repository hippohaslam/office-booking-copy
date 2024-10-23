namespace Hippo.Booking.Infrastructure.Scheduling;

public class SlackAlertParameters
{
    public string Message { get; set; } = string.Empty;

    public int DayOffset { get; set; }
    
    public bool CanConfirm { get; set; }
}