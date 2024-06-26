using Hippo.Booking.Application.Queries.Bookings;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hippo.Booking.API.Endpoints;

public class BookingEndpoints() : EndpointBase("booking", "Bookings")
{
    public override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("{locationId:int}/{date}", 
            async Task<Results<Ok<BookingDayResponse>, NotFound>> (IBookingQueries bookingQueries, int locationId, DateOnly date) =>
            {
                var location = await bookingQueries.GetLocationAndBookingsForTheDay(locationId, date);

                if (location == null)
                {
                    return TypedResults.NotFound();
                }
                
                return TypedResults.Ok(location);
            });
    }
}