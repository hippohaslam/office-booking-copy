using Hippo.Booking.Application.Commands.Areas;
using Hippo.Booking.Core.Enums;

namespace Hippo.Booking.Application.Tests.Validators;

[TestFixture]
public class UpdateAreaRequestValidatorTests()
    : ValidatorTest<UpdateAreaRequest, UpdateAreaRequestValidator>(new UpdateAreaRequestValidator())
{

    public override List<UpdateAreaRequest> PositiveTestCases { get; } = new()
    {
        new UpdateAreaRequest
        {
            Name = "Test Area",
            Description = "Test Description",
            FloorPlanJson = "{}",
            AreaTypeId = AreaTypeEnum.Desks
        },
        new UpdateAreaRequest
        {
            Name = "Test Area",
            AreaTypeId = AreaTypeEnum.Desks
        }
    };

    public override List<UpdateAreaRequest> NegativeTestCases { get; } = new()
    {
        new UpdateAreaRequest
        {
            Name = "",
            AreaTypeId = AreaTypeEnum.Desks
        },
        new UpdateAreaRequest
        {
            Name = "Test Area".PadRight(300),
            AreaTypeId = AreaTypeEnum.Desks
        },
        new UpdateAreaRequest
        {
            Name = "Test Area".PadRight(300),
            Description = "Test Description".PadRight(600),
            AreaTypeId = AreaTypeEnum.Desks
        },
        new UpdateAreaRequest
        {
            Name = "Test Area".PadRight(300),
            Description = "Test Description".PadRight(600),
            AreaTypeId = 0
        },
    };
}