namespace Hippo.Booking.Core.Interfaces;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }

    DateTime Now { get; }

    DateOnly Today { get; }
}