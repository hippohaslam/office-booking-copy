using Hippo.Booking.Application.Queries.Bookings;
using Hippo.Booking.Core.Enums;
using Hippo.Booking.Core.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Caching.Memory;

namespace Hippo.Booking.API.Endpoints;

public class ScreenEndpoints() : EndpointBase("screen", "Screen", AccessLevelEnum.Anonymous)
{
    protected override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("availability/{bookableObjectId}",
            async Task<Results<Ok<BookableObjectBookingStateResponse>, NoContent, BadRequest<string>>> 
                (IBookingQueries bookingQueries, IDateTimeProvider dateTimeProvider, int bookableObjectId) =>
            {
                var now = dateTimeProvider.Now;

                if (now.DayOfWeek == DayOfWeek.Saturday || now.DayOfWeek == DayOfWeek.Sunday ||
                    now.Hour < 7 || now.Hour >= 19)
                {
                    // Outside of working hours, so this will instruct the screen to sleep
                    return TypedResults.NoContent();
                }

                var bookingState = await bookingQueries.GetBookedState(bookableObjectId);

                return TypedResults.Ok(bookingState);
            });
    }
}