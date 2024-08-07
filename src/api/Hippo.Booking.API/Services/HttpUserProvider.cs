using System.Security.Claims;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Core.Models;

namespace Hippo.Booking.API.Services;

public class HttpUserProvider(IHttpContextAccessor httpContextAccessor) : IUserProvider
{
    public RegisteredUserModel? GetCurrentUser()
    {
        var user = httpContextAccessor.HttpContext?.User;

        if (user == null)
        {
            return null;
        }

        var registeredUserModel = new RegisteredUserModel
        {
            UserId = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty,
            FirstName = user.FindFirstValue(ClaimTypes.GivenName) ?? string.Empty,
            LastName = user.FindFirstValue(ClaimTypes.Surname) ?? string.Empty,
            Email = user.FindFirstValue(ClaimTypes.Email) ?? string.Empty
        };

        return registeredUserModel;
    }
}