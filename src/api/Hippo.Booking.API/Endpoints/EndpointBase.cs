using Hippo.Booking.Application;

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
            .WithTags(routePath);
        
        MapEndpoints(grouping);
    }
    
    public abstract void MapEndpoints(RouteGroupBuilder builder);
}