using Hippo.Booking.Application.Models;

namespace Hippo.Booking.Application.Queries.Bookings;

public class BookingLocationResponse
{
    public int Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public List<IdName<int>> Areas { get; set; } = new();
}