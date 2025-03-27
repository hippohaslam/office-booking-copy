namespace Hippo.Booking.Application.Commands.BookingWaitList;

public interface ICreateBookingWaitListCommands
{
    Task<int> Handle(string userId, AddToWaitListRequest request);
}