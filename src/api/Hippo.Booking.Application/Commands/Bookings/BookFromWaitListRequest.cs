namespace Hippo.Booking.Application.Commands.Bookings;

public class BookFromWaitListRequest
{
    public required int BookableObjectId { get; set; }
    public required int AreaId { get; set; }
    public required DateOnly Date { get; set; }
}