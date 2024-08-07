using System.Security.Claims;
using Hippo.Booking.Application.Commands.Users;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Core.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hippo.Booking.API.Endpoints;

public class SessionEndpoints() : EndpointBase("session", "Sessions")
{
    public override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("", Results<Ok<RegisteredUserModel>, UnauthorizedHttpResult>
            (IUserProvider userProvider) =>
        {
            var user = userProvider.GetCurrentUser();

            return user == null
                ? TypedResults.Unauthorized()
                : TypedResults.Ok(user);
        });

        builder.MapPost("google",
            [Authorize(AuthenticationSchemes = "Google")] async (HttpContext httpContext, IUpsertUserCommand userCommand) =>
            {
                var user = httpContext.User;

                var registeredUserDto = new RegisteredUserRequest
                {
                    UserId = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty,
                    FirstName = user.FindFirstValue(ClaimTypes.GivenName) ?? string.Empty,
                    LastName = user.FindFirstValue(ClaimTypes.Surname) ?? string.Empty,
                    Email = user.FindFirstValue(ClaimTypes.Email) ?? string.Empty
                };

                await userCommand.UpsertUser(registeredUserDto);

                var claims = new List<Claim>
                {
                    new(ClaimTypes.NameIdentifier, user.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty),
                    new(ClaimTypes.GivenName, user.FindFirstValue(ClaimTypes.GivenName) ?? string.Empty),
                    new(ClaimTypes.Surname, user.FindFirstValue(ClaimTypes.Surname) ?? string.Empty),
                    new(ClaimTypes.Name, user.FindFirstValue(ClaimTypes.Name) ?? string.Empty),
                    new(ClaimTypes.Email, user.FindFirstValue(ClaimTypes.Email) ?? string.Empty)
                };

                var claimsIdentity = new ClaimsIdentity(claims, "Cookie");
                var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

                await httpContext.SignInAsync(claimsPrincipal);

                return TypedResults.Ok(registeredUserDto);
            });

        builder.MapPost("sign-out", async (HttpContext httpContext) =>
        {
            await httpContext.SignOutAsync();

            return TypedResults.NoContent();
        });
    }
}