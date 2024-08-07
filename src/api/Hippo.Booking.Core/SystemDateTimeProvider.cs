using Hippo.Booking.Core.Interfaces;

namespace Hippo.Booking.Core;

public class SystemDateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;

    public DateTime Now => DateTime.Now;

    public DateOnly Today => DateOnly.FromDateTime(Now);
}