using Hippo.Booking.Application.Commands.BookableObject;
using Hippo.Booking.Core.Enums;

namespace Hippo.Booking.Application.Tests.Validators;

[TestFixture]
public class CreateBookableObjectRequestValidatorTests() : 
    ValidatorTest<CreateBookableObjectRequest, CreateBookableObjectRequestValidator>(new CreateBookableObjectRequestValidator())
{
    public override List<CreateBookableObjectRequest> PositiveTestCases { get; } = new()
    {
        new CreateBookableObjectRequest()
        {
            Name = "Test",
            Description = "Test",
            FloorPlanObjectId = "1",
            BookableObjectTypeId = BookableObjectTypeEnum.Dog
        },
        new CreateBookableObjectRequest()
        {
            Name = "Test",
            BookableObjectTypeId = BookableObjectTypeEnum.Dog
        }
    };
    
    public override List<CreateBookableObjectRequest> NegativeTestCases { get; } = new()
    {
        new CreateBookableObjectRequest()
        {
            Name = "Test",
            Description = "Test",
            FloorPlanObjectId = "1",
            BookableObjectTypeId = (BookableObjectTypeEnum)50
        },
        new CreateBookableObjectRequest()
        {
            Name = "",
            Description = "Test",
            FloorPlanObjectId = "1",
            BookableObjectTypeId = (BookableObjectTypeEnum)50
        }
    };
}