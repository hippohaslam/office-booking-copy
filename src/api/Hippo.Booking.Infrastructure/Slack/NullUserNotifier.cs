using Hippo.Booking.Core.Interfaces;

namespace Hippo.Booking.Infrastructure.Slack;

public class NullUserNotifier : IUserNotifier
{
    public Task NotifyUser(string userId, string message)
    {
        return Task.CompletedTask;
    }
}