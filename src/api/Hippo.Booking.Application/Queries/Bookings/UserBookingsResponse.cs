using Hippo.Booking.Application.Models;

namespace Hippo.Booking.Application.Queries.Bookings;

public class UserBookingsResponse
{
    public int BookingId { get; set; }
    
    public DateOnly Date { get; set; }
    
    public required IdName<int> BookableObject { get; set; }

    public required IdName<int> Location { get; set; }

    public required IdName<int> Area { get; set; }
}