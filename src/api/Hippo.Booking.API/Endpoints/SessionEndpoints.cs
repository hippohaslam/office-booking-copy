using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hippo.Booking.API.Endpoints;

public class SessionEndpoints() : EndpointBase("session", "Sessions")
{
    private class User
    {
        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;
    }
    public override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapPost("",  [AllowAnonymous] async Task<Results<Ok<User>, UnauthorizedHttpResult>> (HttpContext httpContext) =>
        {
            var user = httpContext.User;

            if (user.Identity is { AuthenticationType: "Cookie", IsAuthenticated: true })
            {
                //TODO: Check and update database
                
                return TypedResults.Ok(new User
                {
                    Name = user.FindFirstValue(ClaimTypes.Name) ?? string.Empty,
                    Email = user.FindFirstValue(ClaimTypes.Email) ?? string.Empty
                });
            }

            return TypedResults.Unauthorized();
        });

        builder.MapPost("google", 
            [Authorize(AuthenticationSchemes = "Google")] async (HttpContext httpContext) =>
            {
                var user = httpContext.User;
                
                var claims = new List<Claim>
                {
                    new(ClaimTypes.NameIdentifier, user.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty),
                    new(ClaimTypes.Name, user.FindFirstValue(ClaimTypes.Name) ?? string.Empty),
                    new(ClaimTypes.Email, user.FindFirstValue(ClaimTypes.Email) ?? string.Empty)
                };

                var claimsIdentity = new ClaimsIdentity(claims, "Cookie");
                var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

                await httpContext.SignInAsync(claimsPrincipal);

                return TypedResults.Ok(new User
                {
                    Name = user.FindFirstValue(ClaimTypes.Name) ?? string.Empty,
                    Email = user.FindFirstValue(ClaimTypes.Email) ?? string.Empty
                });
            });

        builder.MapPost("sign-out", async (HttpContext httpContext) =>
        {
            await httpContext.SignOutAsync();
            
            return TypedResults.NoContent();
        });
    }
}