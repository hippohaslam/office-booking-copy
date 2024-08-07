using FluentValidation;

namespace Hippo.Booking.Application.Commands.Bookings;

public class CreateBookingRequest
{
    public int BookableObjectId { get; set; }

    public int AreaId { get; set; }

    public DateOnly Date { get; set; }

    public string UserId { get; set; } = string.Empty;
}

public class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequest>
{
    public CreateBookingRequestValidator()
    {
        RuleFor(x => x.BookableObjectId).NotEmpty();
        RuleFor(x => x.AreaId).NotEmpty();
        RuleFor(x => x.Date).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
    }
}