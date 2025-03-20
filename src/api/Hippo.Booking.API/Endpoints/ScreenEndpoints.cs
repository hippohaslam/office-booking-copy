using Hippo.Booking.Application.Queries.Bookings;
using Hippo.Booking.Core.Enums;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Hippo.Booking.API.Endpoints;

public class ScreenEndpoints() : EndpointBase("screen", "Screen", AccessLevelEnum.Anonymous)
{
    protected override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("availability/{bookableObjectId}",
            async Task<Results<Ok<BookableObjectBookingStateResponse>, BadRequest<string>, NotFound>>
            (
                IBookingQueries bookingQueries,
                int bookableObjectId,
                [FromHeader(Name = "Auth-Key")] string? authKey,
                IConfiguration configuration
            ) =>
            {
                if (authKey != configuration["Screen:AuthKey"])
                {
                    return TypedResults.NotFound();
                }

                var bookingState = await bookingQueries.GetBookedState(bookableObjectId);

                return TypedResults.Ok(bookingState);
            });

        builder.MapGet("location/{locationId:int}/area/{areaId:int}/{date}",
            async Task<Results<Ok<BookingDayResponse>, NotFound>> 
                (
                    IBookingQueries bookingQueries, 
                    int locationId, 
                    int areaId, 
                    DateOnly date,
                    [FromHeader(Name = "Auth-Key")] string? authKey,
                    IConfiguration configuration
                ) =>
            {
                if (authKey != configuration["Screen:AuthKey"])
                {
                    return TypedResults.NotFound();
                }

                var location = await bookingQueries.GetAreaAndBookingsForTheDay(locationId, areaId, date);

                return TypedResults.Ok(location);
            });
    }
}