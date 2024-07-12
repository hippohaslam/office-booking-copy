using System.Security.Claims;

namespace Hippo.Booking.API.Extensions;

public static class HttpContextExtensions
{
    public static string GetUserId(this HttpContext context)
    {
        return context.User.FindFirstValue(ClaimTypes.NameIdentifier) ??
               throw new InvalidOperationException("User ID not found in claims.");
    }
}