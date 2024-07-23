using System.Security.Claims;

namespace Hippo.Booking.API.Extensions;

public static class HttpContextExtensions
{
    public static string GetUserId(this HttpContext context)
    {
        return context.User.FindFirstValue(ClaimTypes.NameIdentifier) ??
               throw new InvalidOperationException("User ID not found in claims.");
    }
    
    public static string GetUserName(this HttpContext context)
    {
        var firstName = context.User.FindFirstValue(ClaimTypes.GivenName);
        var lastName = context.User.FindFirstValue(ClaimTypes.Surname);
        
        return (firstName, lastName) switch
        {
            (null, null) => throw new InvalidOperationException("User name not found in claims."),
            (null, _) => lastName,
            (_, null) => firstName,
            _ => $"{firstName} {lastName}"
        };
    }
}