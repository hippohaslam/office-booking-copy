namespace Hippo.Booking.Application.Queries.Bookings;

public interface IBookingQueries
{
    Task<BookingDayResponse?> GetLocationAndBookingsForTheDay(int locationId, DateOnly date);
}