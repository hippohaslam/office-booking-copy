using Hippo.Booking.Core.Interfaces;

namespace Hippo.Booking.Core.Mocks;

public class NullBookingCalendar : IBookingCalendar
{
    public Task<string> CreateBookingEvent(string email, string summary, DateOnly date, CancellationToken ct = default)
    {
        return Task.FromResult("mocked");
    }

    public Task DeleteBookingEvent(string email, string eventId, CancellationToken ct = default)
    {
        return Task.CompletedTask;
    }
}