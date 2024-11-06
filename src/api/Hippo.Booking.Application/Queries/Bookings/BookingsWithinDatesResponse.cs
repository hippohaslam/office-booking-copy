namespace Hippo.Booking.Application.Queries.Bookings;

public class BookingsWithinDatesResponse : UserBookingsResponse
{
    public string BookedBy { get; set; } = string.Empty;
}