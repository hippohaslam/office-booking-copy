using Hippo.Booking.API.Extensions;
using Hippo.Booking.Application.Models;

namespace Hippo.Booking.API.Endpoints;

public sealed class SiteEndpoints() : EndpointBase("sites", "Sites")
{
    public override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("", async (HttpContext http, CancellationToken ct) =>
        {
            await http.Response.WriteAsync("Hello from sites", cancellationToken: ct);
        });
        
        builder.MapPostMediator<CreateSiteRequest>("");
    }
}