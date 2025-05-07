namespace Hippo.Booking.Application.Commands.Bookings;

public class BookingCancelledRequest
{
    public required int BookableObjectId { get; set; }
    
    public required int AreaId { get; set; }
    
    public required DateOnly Date { get; set; }
    
    public required string UserEmail { get; set; }
    
    public required string? CalendarEventId { get; set; }
}