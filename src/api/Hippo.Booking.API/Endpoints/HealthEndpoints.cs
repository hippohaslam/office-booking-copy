using Hippo.Booking.Core.Enums;

namespace Hippo.Booking.API.Endpoints;

public class HealthEndpoints() : EndpointBase("health", "Health Check", AccessLevelEnum.Anonymous)
{
    public override void MapEndpoints(RouteGroupBuilder group)
    {
        group.MapGet("", async (HttpContext http, CancellationToken ct) =>
        {
            await http.Response.WriteAsync("Healthy", cancellationToken: ct);
        });
    }
}