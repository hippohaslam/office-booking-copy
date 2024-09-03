using FluentValidation;
using Hippo.Booking.Core.Enums;

namespace Hippo.Booking.Application.Commands.BookableObject;

public class CreateBookableObjectRequest
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string FloorPlanObjectId { get; set; } = string.Empty;

    public BookableObjectTypeEnum BookableObjectTypeId { get; set; }
}

public class CreateBookableObjectRequestValidator : AbstractValidator<CreateBookableObjectRequest>
{
    public CreateBookableObjectRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.BookableObjectTypeId).IsInEnum();
    }
}