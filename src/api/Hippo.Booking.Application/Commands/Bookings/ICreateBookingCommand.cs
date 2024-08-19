using Hippo.Booking.Application.Queries.Bookings;

namespace Hippo.Booking.Application.Commands.Bookings;

public interface ICreateBookingCommand
{
    Task<BookingResponse> Handle(CreateBookingRequest request);
}