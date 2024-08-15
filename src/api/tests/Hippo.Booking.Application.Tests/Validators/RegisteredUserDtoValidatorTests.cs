using Hippo.Booking.Application.Commands.Users;

namespace Hippo.Booking.Application.Tests.Validators;

[TestFixture]
public class RegisteredUserDtoValidatorTests() :
    ValidatorTest<RegisteredUserRequest, RegisteredUserDtoValidator>(new RegisteredUserDtoValidator())
{
    public override List<RegisteredUserRequest> PositiveTestCases { get; } = new()
    {
        new RegisteredUserRequest
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@test.com",
            UserId = "test"
        }
    };

    public override List<RegisteredUserRequest> NegativeTestCases { get; } = new()
    {
        new RegisteredUserRequest
        {
            FirstName = "",
            LastName = "User",
            Email = "test@test.com",
            UserId = "test"
        },
        new RegisteredUserRequest
        {
            FirstName = "Test",
            LastName = "",
            Email = "test@test.com",
            UserId = "test"
        },
        new RegisteredUserRequest
        {
            FirstName = "Test",
            LastName = "User",
            Email = "",
            UserId = "test"
        },
        new RegisteredUserRequest
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@test.com",
            UserId = ""
        }
    };
}