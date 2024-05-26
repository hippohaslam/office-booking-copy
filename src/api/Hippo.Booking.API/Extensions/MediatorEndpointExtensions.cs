using FluentValidation;
using Hippo.Booking.Application;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Hippo.Booking.API.Extensions;

public static class MediatorEndpointExtensions
{
    public static IEndpointConventionBuilder MapGetMediator<TRequest>(this RouteGroupBuilder builder, string path)
    {
        return builder.MapGet(path, Handle<TRequest>());
    }
    
    public static IEndpointConventionBuilder MapGetMediator<TRequest, TResponse>(this RouteGroupBuilder builder, string path)
    {
        return builder.MapGet(path, Handle<TRequest, TResponse>());
    }
    
    public static IEndpointConventionBuilder MapPostMediator<TRequest>(this RouteGroupBuilder builder, string path)
    {
        return builder.MapPost(path, Handle<TRequest>());
    }
    
    public static IEndpointConventionBuilder MapPostMediator<TRequest, TResponse>(this RouteGroupBuilder builder, string path)
    {
        return builder.MapPost(path, Handle<TRequest, TResponse>());
    }
    
    public static IEndpointConventionBuilder MapPutMediator<TRequest>(this RouteGroupBuilder builder, string path)
    {
        return builder.MapPut(path, Handle<TRequest>());
    }
    
    public static IEndpointConventionBuilder MapPutMediator<TRequest, TResponse>(this RouteGroupBuilder builder, string path)
    {
        return builder.MapPut(path, Handle<TRequest, TResponse>());
    }
    
    public static IEndpointConventionBuilder MapDeleteMediator<TRequest>(this RouteGroupBuilder builder, string path)
    {
        return builder.MapDelete(path, Handle<TRequest>());
    }
    
    public static IEndpointConventionBuilder MapDeleteMediator<TRequest, TResponse>(this RouteGroupBuilder builder, string path)
    {
        return builder.MapDelete(path, Handle<TRequest, TResponse>());
    }
    
    private static Delegate Handle<TRequest>() =>
        async Task<Results<NoContent, BadRequest<string>, ValidationProblem>> (IMediator mediator, [FromBody] TRequest request, CancellationToken ct) =>
        {
            try
            {
                await mediator.Execute(request);
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
            
            return TypedResults.NoContent();
        };
    
    private static Delegate Handle<TRequest, TResponse>() =>
        async Task<Results<Ok<TResponse>, BadRequest<string>, ValidationProblem>> (IMediator mediator, [FromBody] TRequest request, CancellationToken ct) =>
        {
            try
            {
                var response = await mediator.Execute<TRequest, TResponse>(request);
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
        };
}