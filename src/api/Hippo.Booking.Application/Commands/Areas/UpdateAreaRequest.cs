using FluentValidation;
using Hippo.Booking.Application.Models;
using Hippo.Booking.Core.Enums;

namespace Hippo.Booking.Application.Commands.Areas;

public class UpdateAreaRequest
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string FloorPlanJson { get; set; } = string.Empty;

    public AreaTypeEnum AreaTypeId { get; set; }
}

public class UpdateAreaRequestValidator : AbstractValidator<UpdateAreaRequest>
{
    public UpdateAreaRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(ValidationConstants.NameMaxLength);
        RuleFor(x => x.Description).MaximumLength(ValidationConstants.DescriptionMaxLength);
        RuleFor(x => x.AreaTypeId).IsInEnum();
    }
}