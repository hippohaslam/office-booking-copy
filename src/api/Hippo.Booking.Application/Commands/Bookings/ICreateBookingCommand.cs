namespace Hippo.Booking.Application.Commands.Bookings;

public interface ICreateBookingCommand
{
    Task<int> Handle(CreateBookingRequest request);
}