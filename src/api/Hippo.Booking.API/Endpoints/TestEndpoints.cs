using System.Security.Claims;
using Hippo.Booking.API.Extensions;
using Hippo.Booking.Core.Enums;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hippo.Booking.API.Endpoints;

public class TestEndpoints() : EndpointBase("test", "Test", AccessLevelEnum.Anonymous)
{
    public override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("session/userid", Results<Ok<string>, UnauthorizedHttpResult>
            (HttpContext httpContext) =>
        {
            var user = httpContext.User;

            if (user.Identity is { AuthenticationType: "Cookie", IsAuthenticated: true })
            {
                return TypedResults.Ok(httpContext.GetUserId() ?? string.Empty);
            }

            return TypedResults.Unauthorized();
        });
    }
}