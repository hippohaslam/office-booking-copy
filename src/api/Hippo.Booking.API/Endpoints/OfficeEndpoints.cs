using Hippo.Booking.API.Extensions;
using Hippo.Booking.Application.Models;
using Hippo.Booking.Application.Queries.Offices;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hippo.Booking.API.Endpoints;

public class OfficeEndpoints() : EndpointBase("office", "Offices")
{
    public override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("", async (IOfficeQueries officeQueries) => 
            TypedResults.Ok(await officeQueries.GetOffices()));
        
        builder.MapGet("{id}", async Task<Results<Ok<OfficeQueryResponse>, NotFound>> (int id, IOfficeQueries officeQueries) =>
        {
            var office = await officeQueries.GetOfficeById(id);

            return office is null
                ? TypedResults.NotFound()
                : TypedResults.Ok(office);
        });
        
        builder.MapPostMediator<CreateOfficeRequest, int>("");
    }
}