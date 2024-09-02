using Hippo.Booking.Application.Commands.BookableObject;
using Hippo.Booking.Core.Enums;

namespace Hippo.Booking.Application.Tests.Validators;

[TestFixture]
public class UpdateBookableObjectRequestValidatorTests() : 
    ValidatorTest<UpdateBookableObjectRequest, UpdateBookableObjectRequestValidator>(new UpdateBookableObjectRequestValidator())
{
    public override List<UpdateBookableObjectRequest> PositiveTestCases { get; } = new()
    {
        new UpdateBookableObjectRequest()
        {
            Name = "Test",
            Description = "Test",
            FloorPlanObjectId = "1",
            BookableObjectTypeId = BookableObjectTypeEnum.Dog
        },
        new UpdateBookableObjectRequest()
        {
            Name = "Test",
            BookableObjectTypeId = BookableObjectTypeEnum.Dog
        }
    };
    
    public override List<UpdateBookableObjectRequest> NegativeTestCases { get; } = new()
    {
        new UpdateBookableObjectRequest()
        {
            Name = "Test",
            Description = "Test",
            FloorPlanObjectId = "1",
            BookableObjectTypeId = (BookableObjectTypeEnum)50
        },
        new UpdateBookableObjectRequest()
        {
            Name = "",
            Description = "Test",
            FloorPlanObjectId = "1",
            BookableObjectTypeId = (BookableObjectTypeEnum)50
        }
    };
}