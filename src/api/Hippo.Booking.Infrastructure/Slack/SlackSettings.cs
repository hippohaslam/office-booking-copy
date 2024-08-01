namespace Hippo.Booking.Infrastructure.Slack;

public class SlackSettings
{
    public string Token { get; set; } = string.Empty;

    public string SigningSecret { get; set; } = string.Empty;
}