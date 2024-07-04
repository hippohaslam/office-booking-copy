namespace Hippo.Booking.Application.Queries.Bookings;

public interface IBookingQueries
{
    Task<BookingDayResponse?> GetAreaAndBookingsForTheDay(int locationId, int areaId, DateOnly date);
}