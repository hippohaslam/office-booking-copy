namespace Hippo.Booking.API.Endpoints;

public sealed class HealthEndpoints() : EndpointBase("health", "Health Check")
{
    public override void MapEndpoints(RouteGroupBuilder group)
    {
        group.MapGet("", async (HttpContext http, CancellationToken ct) =>
        {
            await http.Response.WriteAsync("Healthy", cancellationToken: ct);
        });
    }
}