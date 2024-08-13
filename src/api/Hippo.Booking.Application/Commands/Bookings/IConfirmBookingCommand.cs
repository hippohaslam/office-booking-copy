namespace Hippo.Booking.Application.Commands.Bookings;

public interface IConfirmBookingCommand
{
    Task Handle(int bookingId);
}