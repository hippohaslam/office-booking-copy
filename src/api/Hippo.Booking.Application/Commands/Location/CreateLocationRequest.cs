using FluentValidation;

namespace Hippo.Booking.Application.Commands.Location;

public class CreateLocationRequest
{
    public string Name { get; set; } = string.Empty;
}

public class CreateLocationRequestValidator : AbstractValidator<CreateLocationRequest>
{
    public CreateLocationRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
    }
}