namespace Hippo.Booking.Application.Queries.Bookings;

public interface IBookingQueries
{
    Task<BookingResponse?> GetBookingById(int bookingId);
    
    Task<List<UserBookingsResponse>> GetUpcomingBookingsForUser(string userId);
    
    Task<BookingDayResponse?> GetAreaAndBookingsForTheDay(int locationId, int areaId, DateOnly date);
}