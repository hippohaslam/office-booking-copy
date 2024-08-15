using Hippo.Booking.Application.Commands.Areas;
using Hippo.Booking.Core.Enums;

namespace Hippo.Booking.Application.Tests.Validators;

[TestFixture]
public class CreateAreaRequestValidatorTests()
    : ValidatorTest<CreateAreaRequest, CreateAreaRequestValidator>(new CreateAreaRequestValidator())
{

    public override List<CreateAreaRequest> PositiveTestCases { get; } = new()
    {
        new CreateAreaRequest
        {
            Name = "Test Area",
            Description = "Test Description",
            AreaTypeId = AreaTypeEnum.Desks
        },
        new CreateAreaRequest
        {
            Name = "Test Area",
            AreaTypeId = AreaTypeEnum.Desks
        }
    };

    public override List<CreateAreaRequest> NegativeTestCases { get; } = new()
    {
        new CreateAreaRequest
        {
            Name = "",
            AreaTypeId = AreaTypeEnum.Desks
        },
        new CreateAreaRequest
        {
            Name = "Test Area".PadRight(300),
            AreaTypeId = AreaTypeEnum.Desks
        },
        new CreateAreaRequest
        {
            Name = "Test Area".PadRight(300),
            Description = "Test Description".PadRight(600),
            AreaTypeId = AreaTypeEnum.Desks
        },
        new CreateAreaRequest
        {
            Name = "Test Area".PadRight(300),
            Description = "Test Description".PadRight(600),
            AreaTypeId = 0
        },
    };
}