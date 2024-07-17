namespace Hippo.Booking.Application.Queries.Bookings;

public interface IBookingQueries
{
    Task<List<UserBookingsResponse>> GetUpcomingBookingsForUser(string userId);
    
    Task<BookingDayResponse?> GetAreaAndBookingsForTheDay(int locationId, int areaId, DateOnly date);
}