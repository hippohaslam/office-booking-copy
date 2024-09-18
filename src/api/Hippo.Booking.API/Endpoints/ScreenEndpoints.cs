using Hippo.Booking.Application.Queries.Bookings;
using Hippo.Booking.Core.Enums;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hippo.Booking.API.Endpoints;

public class ScreenEndpoints() : EndpointBase("screen", "Screen", AccessLevelEnum.Anonymous)
{
    protected override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("availability/{bookableObjectId}",
            async Task<Results<Ok<BookableObjectBookingStateResponse>, BadRequest<string>>> 
                (IBookingQueries bookingQueries, int bookableObjectId) =>
            {
                var bookingState = await bookingQueries.GetBookedState(bookableObjectId);

                return TypedResults.Ok(bookingState);
            });
    }
}