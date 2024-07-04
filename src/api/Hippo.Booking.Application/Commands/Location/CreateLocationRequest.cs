using FluentValidation;
using Hippo.Booking.Application.Models;

namespace Hippo.Booking.Application.Commands.Location;

public class CreateLocationRequest
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}

public class CreateLocationRequestValidator : AbstractValidator<CreateLocationRequest>
{
    public CreateLocationRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(ValidationConstants.NameMaxLength);
        RuleFor(x => x.Description).MaximumLength(ValidationConstants.DescriptionMaxLength);
    }
}