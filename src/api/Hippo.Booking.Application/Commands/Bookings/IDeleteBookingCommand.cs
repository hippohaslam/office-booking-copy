namespace Hippo.Booking.Application.Commands.Bookings;

public interface IDeleteBookingCommand
{
    Task Handle(DeleteBookingRequest request);
}