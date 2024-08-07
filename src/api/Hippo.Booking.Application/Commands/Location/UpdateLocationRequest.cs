using FluentValidation;
using Hippo.Booking.Application.Models;

namespace Hippo.Booking.Application.Commands.Location;

public class UpdateLocationRequest
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}

public class UpdateLocationRequestValidator : AbstractValidator<UpdateLocationRequest>
{
    public UpdateLocationRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(ValidationConstants.NameMaxLength);
        RuleFor(x => x.Description).MaximumLength(ValidationConstants.DescriptionMaxLength);
    }
}