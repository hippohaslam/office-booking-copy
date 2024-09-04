using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Core.Models;

namespace Hippo.Booking.Application.Tests;

public class TestUserProvider : IUserProvider
{
    public RegisteredUserModel? GetCurrentUser()
    {
        return new RegisteredUserModel
        {
            UserId = "test",
            FirstName = "Test",
            LastName = "User",
            Email = "test@user.com"
        };
    }
}