using FluentValidation;

namespace Hippo.Booking.Application.Models;

public class CreateOfficeRequest
{
    public string Name { get; set; } = string.Empty;
}

public class CreateOfficeRequestValidator : AbstractValidator<CreateOfficeRequest>
{
    public CreateOfficeRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
    }
}