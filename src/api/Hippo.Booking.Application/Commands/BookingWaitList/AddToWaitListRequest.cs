namespace Hippo.Booking.Application.Commands.BookingWaitList;

public class AddToWaitListRequest
{
    public int AreaId { get; set; }
    public DateOnly Date { get; set; }
}