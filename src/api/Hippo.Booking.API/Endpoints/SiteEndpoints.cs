using Hippo.Booking.Application;
using Hippo.Booking.Application.Models;

namespace Hippo.Booking.API.Endpoints;

public sealed class SiteEndpoints() : EndpointBase("sites")
{
    public override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("/", async (http) =>
        {
            await http.Response.WriteAsync("Hello from sites");
        });

        builder.MapPostMediator<CreateSiteRequest>("/");
    }
}