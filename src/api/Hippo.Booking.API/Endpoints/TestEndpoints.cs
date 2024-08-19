using System.Diagnostics.CodeAnalysis;
using FluentValidation;
using Hippo.Booking.API.Extensions;
using Hippo.Booking.Application.Commands.Location;
using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Core.Enums;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hippo.Booking.API.Endpoints;

[ExcludeFromCodeCoverage(Justification = "Dummy endpoints for testing")]
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
        
        builder.MapGet("bad-request", async Task<Results<NoContent, BadRequest<string>, ForbidHttpResult, ValidationProblem>>
            () =>
        {
            return await HandleResponse(() => throw new ClientException("Bad request message"));
        });
        
        builder.MapGet("forbidden", async Task<Results<NoContent, BadRequest<string>, ForbidHttpResult, ValidationProblem>>
            () =>
        {
            return await HandleResponse(() => throw new ClientForbiddenException());
        });
        
        builder.MapGet("validation-problem", async Task<Results<NoContent, BadRequest<string>, ForbidHttpResult, ValidationProblem>>
            (IValidator<CreateLocationRequest> locationValidator) =>
        {
            return await HandleResponse(async () =>
            {
                var locationRequest = new CreateLocationRequest();
                
                await locationValidator.ValidateAndThrowAsync(locationRequest);
            });
        });
    }
}