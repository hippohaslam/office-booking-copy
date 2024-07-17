using Hippo.Booking.API.Extensions;
using Hippo.Booking.Application.Commands.Bookings;
using Hippo.Booking.Application.Queries.Bookings;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Hippo.Booking.API.Endpoints;

public class BookingEndpoints() : EndpointBase("booking", "Bookings")
{
    public override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("upcoming", 
            async Task<Results<Ok<List<UserBookingsResponse>>, UnauthorizedHttpResult>> (IBookingQueries bookingQueries, HttpContext httpContext) =>
            {
                var userId = httpContext.GetUserId();

                if (string.IsNullOrEmpty(userId))
                {
                    return TypedResults.Unauthorized();
                }
                
                var bookings = await bookingQueries.GetUpcomingBookingsForUser(userId);
                
                return TypedResults.Ok(bookings);
            });
        
        builder.MapGet("location/{locationId:int}/area/{areaId:int}/{date}", 
            async Task<Results<Ok<BookingDayResponse>, NotFound>> (IBookingQueries bookingQueries, int locationId, int areaId, DateOnly date) =>
            {
                var location = await bookingQueries.GetAreaAndBookingsForTheDay(locationId, areaId, date);

                if (location == null)
                {
                    return TypedResults.NotFound();
                }
                
                return TypedResults.Ok(location);
            });
        
        builder.MapPost("location/{locationId:int}/area/{areaId:int}/{date}/bookable-object/{bookableObjectId:int}", 
            async Task<Results<NoContent, BadRequest<string>, ValidationProblem>> (
                HttpContext httpContext,
                ICreateBookingCommand createBookingCommand, 
                int locationId, 
                int areaId, 
                DateOnly date,
                int bookableObjectId) =>
            {
                var createBookingRequest = new CreateBookingRequest
                {
                    AreaId = areaId,
                    Date = date,
                    BookableObjectId = bookableObjectId,
                    UserId = httpContext.GetUserId()
                };

                return await HandleResponse(
                    async () => await createBookingCommand.Handle(createBookingRequest));
            });
    }
}