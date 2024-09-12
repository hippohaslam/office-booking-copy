namespace Hippo.Booking.Application.Queries.Bookings;

public class BookableObjectBookingStateResponse
{
    public bool IsBooked { get; set; }
    
    public string ObjectName { get; set; } = string.Empty;
    
    public string? BookedBy { get; set; }
}