using Hippo.Booking.Application;

namespace Hippo.Booking.API.Extensions;

public static class MediatorEndpointExtensions
{
    public static IEndpointConventionBuilder MapGetMediator<TRequest>(this RouteGroupBuilder builder, string path)
    {
        return builder.MapGet(path, async (HttpContext http, IMediator mediator, CancellationToken ct) =>
        {
            var request = await http.Request.ReadFromJsonAsync<TRequest>(cancellationToken: ct);
            await mediator.Execute<TRequest>(request);
            return TypedResults.NoContent();
        });
    }
    
    public static IEndpointConventionBuilder MapGetMediator<TRequest, TResponse>(this RouteGroupBuilder builder, string path)
    {
        return builder.MapGet(path, async (HttpContext http, IMediator mediator, CancellationToken ct) =>
        {
            var request = await http.Request.ReadFromJsonAsync<TRequest>(cancellationToken: ct);
            var response = await mediator.Execute<TRequest, TResponse>(request);
            return TypedResults.Ok(response);
        });
    }
    
    public static IEndpointConventionBuilder MapPostMediator<TRequest>(this RouteGroupBuilder builder, string path)
    {
        return builder.MapPost(path, async (HttpContext http, IMediator mediator, CancellationToken ct) =>
        {
            var request = await http.Request.ReadFromJsonAsync<TRequest>(cancellationToken: ct);
            await mediator.Execute<TRequest>(request);
            return TypedResults.NoContent();
        });
    }
    
    public static IEndpointConventionBuilder MapPostMediator<TRequest, TResponse>(this RouteGroupBuilder builder, string path)
    {
        return builder.MapPost(path, async (HttpContext http, IMediator mediator, CancellationToken ct) =>
        {
            var request = await http.Request.ReadFromJsonAsync<TRequest>(cancellationToken: ct);
            var response = await mediator.Execute<TRequest, TResponse>(request);
            return TypedResults.Ok(response);
        });
    }
    
    public static IEndpointConventionBuilder MapPutMediator<TRequest>(this RouteGroupBuilder builder, string path)
    {
        return builder.MapPost(path, async (HttpContext http, IMediator mediator, CancellationToken ct) =>
        {
            var request = await http.Request.ReadFromJsonAsync<TRequest>(cancellationToken: ct);
            await mediator.Execute<TRequest>(request);
            return TypedResults.NoContent();
        });
    }
    
    public static IEndpointConventionBuilder MapPutMediator<TRequest, TResponse>(this RouteGroupBuilder builder, string path)
    {
        return builder.MapPost(path, async (HttpContext http, IMediator mediator, CancellationToken ct) =>
        {
            var request = await http.Request.ReadFromJsonAsync<TRequest>(cancellationToken: ct);
            var response = await mediator.Execute<TRequest, TResponse>(request);
            return TypedResults.Ok(response);
        });
    }
}