using FluentValidation;
using Hippo.Booking.API.Extensions;
using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Core.Enums;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hippo.Booking.API.Endpoints;

public abstract class EndpointBase(string routePath, string swaggerGroupName, AccessLevelEnum accessLevel)
{
    public void Map(WebApplication app)
    {
        if (!routePath.StartsWith("/"))
        {
            routePath = $"/{routePath}";
        }

        var grouping = app.MapGroup(routePath)
            .WithTags(swaggerGroupName)
            .WithAccessLevel(accessLevel);

        MapEndpoints(grouping);
    }
    
    protected abstract void MapEndpoints(RouteGroupBuilder builder);

    protected async Task<Results<Created<TResponse>, BadRequest<string>, ForbidHttpResult, ValidationProblem, Conflict<string>, UnauthorizedHttpResult>> HandleCreatedResponse<TResponse>(
        Func<Task<TResponse>> handle,
        Func<TResponse, string> createdUrl)
    {
        var response = await HandleResponse(handle);

        return response.Result switch
        {
            Ok<TResponse> ok => TypedResults.Created($"/{createdUrl(ok.Value!)}", ok.Value),
            BadRequest<string> badRequest => badRequest,
            ForbidHttpResult forbid => forbid,
            ValidationProblem validationProblem => validationProblem,
            Conflict<string> conflict => conflict,
            _ => throw new InvalidOperationException()
        };
    }

    protected async Task<Results<Ok<TResponse>, BadRequest<string>, ValidationProblem, Conflict<string>>> HandleResponse<TResponse>(Func<Task<TResponse>> handle)
    {
        try
        {
            var response = await handle();
            return TypedResults.Ok(response);
        }
        catch (ClientException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
        catch (ValidationException ex)
        {
            var errors = ex.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(k => k.Key, v => v.Select(x => x.ErrorMessage).ToArray());

            return TypedResults.ValidationProblem(errors);
        }
    }

    protected async Task<Results<NoContent, BadRequest<string>, ForbidHttpResult, ValidationProblem>> HandleResponse(Func<Task> handle)
    {
        try
        {
            await handle.Invoke();
            return TypedResults.NoContent();
        }
        catch (ClientException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
        catch (ClientForbiddenException)
        {
            return TypedResults.Forbid();
        }
        catch (ValidationException ex)
        {
            var errors = ex.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(k => k.Key, v => v.Select(x => x.ErrorMessage).ToArray());

            return TypedResults.ValidationProblem(errors);
        }
    }
}