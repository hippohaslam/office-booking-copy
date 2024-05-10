using Hippo.Booking.Application;

namespace Hippo.Booking.API.Endpoints;

public abstract class EndpointBase(string routePath)
{
    public void Map(WebApplication app)
    {
        var grouping = app.MapGroup(routePath);
        
        MapEndpoints(grouping);
    }
    
    public abstract void MapEndpoints(RouteGroupBuilder builder);
}

public static class MediatorEndpointExtensions
{
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
}