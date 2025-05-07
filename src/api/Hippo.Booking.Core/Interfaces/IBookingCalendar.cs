namespace Hippo.Booking.Core.Interfaces;

public interface IBookingCalendar
{
    Task<string> CreateBookingEvent(string email, string summary, DateOnly date, CancellationToken ct = default);
    
    Task DeleteBookingEvent(string email, string eventId, CancellationToken ct = default);
}