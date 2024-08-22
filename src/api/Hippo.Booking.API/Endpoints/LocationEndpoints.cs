using Hippo.Booking.Application.Queries.Locations;
using Hippo.Booking.Core.Enums;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hippo.Booking.API.Endpoints;

public class LocationEndpoints() : EndpointBase("location", "Locations", AccessLevelEnum.User)
{
    protected override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("", async (ILocationQueries locationQueries) =>
            TypedResults.Ok(await locationQueries.GetLocations()));

        builder.MapGet("{id}", async Task<Results<Ok<LocationQueryResponse>, NotFound>> (int id, ILocationQueries locationQueries) =>
        {
            var location = await locationQueries.GetLocationById(id);

            return location is null
                ? TypedResults.NotFound()
                : TypedResults.Ok(location);
        });
        
        builder.MapGet("{locationId:int}/area", async (IAreaQueries areaQueries, int locationId) =>
            TypedResults.Ok(await areaQueries.GetAreas(locationId)));

        builder.MapGet("{locationId:int}/area/{areaId}",
            async Task<Results<Ok<AreaQueryResponse>, NotFound>>
                (int locationId, int areaId, IAreaQueries areaQueries) =>
            {
                var areas = await areaQueries.GetAreaById(locationId, areaId);

                return areas is null
                    ? TypedResults.NotFound()
                    : TypedResults.Ok(areas);
            });
    }
}