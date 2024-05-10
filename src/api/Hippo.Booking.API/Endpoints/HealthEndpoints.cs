using Hippo.Booking.Application;

namespace Hippo.Booking.API.Endpoints;

public sealed class HealthEndpoints() : EndpointBase("health")
{
    public override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("/", async (http) =>
        {
            await http.Response.WriteAsync("Healthy");
        });
    }
}