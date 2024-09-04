using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Core.Models;

namespace Hippo.Booking.E2ETests.Support;

public class TestUserProvider : IUserProvider
{
    public RegisteredUserModel GetCurrentUser()
    {
        return new RegisteredUserModel
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@test.com"
        };
    }
}