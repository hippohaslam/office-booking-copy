using Hippo.Booking.Application.Commands.Location;

namespace Hippo.Booking.Application.Tests.Validators;

[TestFixture]
public class CreateLocationValidationTests() :
    ValidatorTest<CreateLocationRequest, CreateLocationRequestValidator>(new CreateLocationRequestValidator())
{
    public override List<CreateLocationRequest> PositiveTestCases { get; } = new()
    {
        new CreateLocationRequest
        {
            Name = "Test Location",
            Description = "Test Description",
            Address = "Test Address"
        },
        new CreateLocationRequest
        {
            Name = "Test Location",
            Address = "Test Address"
        }
    };

    public override List<CreateLocationRequest> NegativeTestCases { get; } = new()
    {
        new CreateLocationRequest
        {
            Name = null!,
            Description = "Test"
        },
        new CreateLocationRequest
        {
            Name = null!,
            Description = "Test",
            Address = "Test Address"
        },
        new CreateLocationRequest
        {
            Name = "Test Location".PadRight(200),
            Address = "Test Address"
        },
        new CreateLocationRequest
        {
            Name = "Test Location",
            Description = "Test Description".PadRight(600),
            Address = "Test Address"
        }
    };
}