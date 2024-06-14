using Hippo.Booking.Application.Commands.BookableObject;
using Hippo.Booking.Application.Commands.Location;
using Hippo.Booking.Application.Queries.Locations;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hippo.Booking.API.Endpoints;

public class LocationEndpoints() : EndpointBase("location", "Locations")
{
    public override void MapEndpoints(RouteGroupBuilder builder)
    {
        MapLocationEndpoints(builder);
        
        builder.MapPost("{locationId:int}/bookable-object", async (int locationId, ICreateBookableObject command, CreateBookableObjectRequest request) =>
        {
            var resp = await HandleCreatedResponse(
                async () => await command.Handle(locationId, request),
                value => $"location/{locationId}/desk/{value}");

            return resp;
        });
        
        builder.MapPut(
            "{locationId:int}/bookable-object/{bookableObjectId:int}", 
            async (int locationId, int bookableObjectId, IUpdateBookableObject command, UpdateBookableObjectRequest request) =>
        {
            return await HandleResponse(async () => await command.Handle(bookableObjectId, locationId, request));
        });
    }

    private void MapLocationEndpoints(RouteGroupBuilder builder)
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
        
        builder.MapPost("", async Task<Results<Created, BadRequest<string>, ValidationProblem>> (ICreateLocationCommmand command, CreateLocationRequest request) =>
        {
            var resp = await HandleCreatedResponse(
                async () => await command.Handle(request),
                value => $"location/{value}");

            return resp;
        });
        
        builder.MapPut("{id:int}", async (int id, IUpdateLocationCommand command, UpdateLocationRequest request) =>
        {
            return await HandleResponse(async () => await command.Handle(id, request));
        });
    }
}