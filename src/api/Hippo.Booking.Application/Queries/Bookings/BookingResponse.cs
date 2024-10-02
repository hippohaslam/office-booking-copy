using Hippo.Booking.Application.Models;

namespace Hippo.Booking.Application.Queries.Bookings;

public class BookingResponse
{
    public int Id { get; set; }
    
    public DateOnly Date { get; set; }

    public required IdName<int> BookableObject { get; set; }
    
    public required IdName<int> Area { get; set; }

    public required BookingLocationResponse Location { get; set; }

    public string UserId { get; set; } = string.Empty;
}