namespace Hippo.Booking.Core.Interfaces;

public interface IUserNotifier
{
    Task NotifyUser(string userId, string message);
}