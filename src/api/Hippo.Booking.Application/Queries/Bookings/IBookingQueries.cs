namespace Hippo.Booking.Application.Queries.Bookings;

public interface IBookingQueries
{
    Task<BookingResponse?> GetBookingById(int bookingId);

    Task<List<UserBookingsResponse>> GetUpcomingBookingsForUser(string userId);
    Task<List<UserBookingsResponse>> GetAllBookingsForUserBetweenDates(string userId, DateOnly from, DateOnly to);

    Task<BookingDayResponse?> GetAreaAndBookingsForTheDay(int locationId, int areaId, DateOnly date);

    Task<BookableObjectBookingStateResponse> GetBookedState(int bookableObjectId);
    /// <summary>
    /// Gets all bookings within a location and area between two dates. Only use for Admins and Reporting.
    /// </summary>
    Task<List<BookingsWithinDatesResponse>> GetAllBookingsWithin(int locationId, int areaId, DateOnly from, DateOnly to);
}