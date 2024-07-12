namespace Hippo.Booking.Application.Commands.Bookings;

public interface ICreateBookingCommand
{
    Task Handle(CreateBookingRequest request);
}