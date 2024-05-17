using FluentValidation;

namespace Hippo.Booking.Application.Models;

public class CreateSiteRequest
{
    public string Name { get; set; } = string.Empty;
}

public class CreateSiteRequestValidator : AbstractValidator<CreateSiteRequest>
{
    public CreateSiteRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
    }
}