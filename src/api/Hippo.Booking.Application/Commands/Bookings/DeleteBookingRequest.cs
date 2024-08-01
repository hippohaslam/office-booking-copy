using FluentValidation;

namespace Hippo.Booking.Application.Commands.Bookings;

public class DeleteBookingRequest
{
    public int BookingId { get; set; }
    
    public int AreaId { get; set; }

    public string UserId { get; set; } = string.Empty;
}

public class DeleteBookingRequestValidator : AbstractValidator<DeleteBookingRequest>
{
    public DeleteBookingRequestValidator()
    {
        RuleFor(x => x.BookingId).NotEmpty();
        RuleFor(x => x.AreaId).NotEmpty();
    }
}