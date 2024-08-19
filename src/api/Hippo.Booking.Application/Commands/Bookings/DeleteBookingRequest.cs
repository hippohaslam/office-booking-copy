using FluentValidation;

namespace Hippo.Booking.Application.Commands.Bookings;

public class DeleteBookingRequest
{
    public int BookingId { get; set; }
}

public class DeleteBookingRequestValidator : AbstractValidator<DeleteBookingRequest>
{
    public DeleteBookingRequestValidator()
    {
        RuleFor(x => x.BookingId).NotEmpty();
    }
}