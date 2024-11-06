using Hippo.Booking.Application.Commands.Areas;
using Hippo.Booking.Application.Commands.BookableObject;
using Hippo.Booking.Application.Commands.Location;
using Hippo.Booking.Application.Queries.Locations;
using Hippo.Booking.Core.Enums;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hippo.Booking.API.Endpoints;

public class AdminLocationEndpoints() : EndpointBase("admin/location", "Admin Locations", AccessLevelEnum.Admin)
{
    protected override void MapEndpoints(RouteGroupBuilder builder)
    {
        MapLocationEndpoints(builder);

        MapAreaEndpoints(builder);

        builder.MapPost("{locationId:int}/area/{areaId:int}/bookable-object",
            async (int locationId, int areaId, ICreateBookableObject command, CreateBookableObjectRequest request) =>
        {
            var resp = await HandleCreatedResponse(
                async () => await command.Handle(locationId, areaId, request),
                value => $"location/{locationId}/area/{areaId}/bookable-object/{value}");

            return resp;
        });

        builder.MapPut(
            "{locationId:int}/area/{areaId:int}/bookable-object/{bookableObjectId:int}",
            async (int locationId, int areaId, int bookableObjectId, IUpdateBookableObject command, UpdateBookableObjectRequest request) =>
        {
            return await HandleResponse(async () => await command.Handle(bookableObjectId, locationId, areaId, request));
        });
    }

    private void MapAreaEndpoints(RouteGroupBuilder builder)
    {
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

        builder.MapPost("{locationId:int}/area", async Task<Results<Created<int>, BadRequest<string>, ForbidHttpResult, ValidationProblem>>
            (int locationId, ICreateAreaCommand command, CreateAreaRequest request) =>
        {
            var resp = await HandleCreatedResponse(
                async () => await command.Handle(locationId, request),
                value => $"location/{locationId}/area/{value}");

            return resp;
        });

        builder.MapPut("{locationId:int}/area/{areaId:int}",
            async (int locationId, int areaId, IUpdateAreaCommand command, UpdateAreaRequest request) =>
        {
            return await HandleResponse(async () => await command.Handle(locationId, areaId, request));
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

        builder.MapPost("", async Task<Results<Created<int>, BadRequest<string>, ForbidHttpResult, ValidationProblem>> (ICreateLocationCommmand command, CreateLocationRequest request) =>
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