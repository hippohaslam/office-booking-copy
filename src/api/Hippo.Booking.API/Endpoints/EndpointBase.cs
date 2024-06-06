using FluentValidation;
using Hippo.Booking.Application;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hippo.Booking.API.Endpoints;

public abstract class EndpointBase(string routePath, string swaggerGroupName)
{
    public void Map(WebApplication app)
    {
        if (!routePath.StartsWith("/"))
        {
            routePath = $"/{routePath}";
        }
        
        var grouping = app.MapGroup(routePath)
            .WithTags(swaggerGroupName);
        
        MapEndpoints(grouping);
    }
    
    protected async Task<Results<Created, BadRequest<string>, ValidationProblem>> HandleCreatedResponse<TResponse>(
        Func<Task<TResponse>> handle,
        Func<TResponse, string> createdUrl)
    {
        var response = await HandleResponse(handle);
        
        return response.Result switch
        {
            Ok<TResponse> ok => TypedResults.Created($"/{createdUrl(ok.Value!)}"),
            BadRequest<string> badRequest => badRequest,
            ValidationProblem validationProblem => validationProblem,
            _ => throw new InvalidOperationException()
        };
    }
    
    protected async Task<Results<Ok<TResponse>, BadRequest<string>, ValidationProblem>> HandleResponse<TResponse>(Func<Task<TResponse>> handle)
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

    protected async Task<Results<NoContent, BadRequest<string>, ValidationProblem>> HandleResponse(Func<Task> handle)
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
        catch (ValidationException ex)
        {
            var errors = ex.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(k => k.Key, v => v.Select(x => x.ErrorMessage).ToArray());
                
            return TypedResults.ValidationProblem(errors);
        }
    }
    
    public abstract void MapEndpoints(RouteGroupBuilder builder);
}