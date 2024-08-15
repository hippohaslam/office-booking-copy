using Hippo.Booking.Application.Commands.Location;

namespace Hippo.Booking.Application.Tests.Validators;

[TestFixture]
public class UpdateLocationValidationTests() :
    ValidatorTest<UpdateLocationRequest, UpdateLocationRequestValidator>(new UpdateLocationRequestValidator())
{
    public override List<UpdateLocationRequest> PositiveTestCases { get; } = new()
    {
        new UpdateLocationRequest
        {
            Name = "Test Location",
            Description = "Test Description"
        },
        new UpdateLocationRequest
        {
            Name = "Test Location"
        }
    };

    public override List<UpdateLocationRequest> NegativeTestCases { get; } = new()
    {
        new UpdateLocationRequest
        {
            Name = null!,
            Description = "Test"
        },
        new UpdateLocationRequest
        {
            Name = "Test Location".PadRight(200),
        },
        new UpdateLocationRequest
        {
            Name = "Test Location",
            Description = "Test Description".PadRight(600)
        }
    };
}