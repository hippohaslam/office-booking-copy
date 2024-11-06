using Hippo.Booking.Application.Commands.Bookings;
using Hippo.Booking.Application.Queries.Bookings;
using Hippo.Booking.Core.Enums;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hippo.Booking.API.Endpoints;

public class AdminBookingsEndpoints() : EndpointBase("admin/bookings", "Admin Bookings", AccessLevelEnum.Admin)
{
    protected override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("", async (IBookingQueries bookingQueries, int locationId, int areaId, DateOnly from, DateOnly to) =>
        {
            var bookings = await bookingQueries.GetAllBookingsWithin(locationId, areaId, from, to);
            return TypedResults.Ok(bookings);
        });
        
        builder.MapDelete("{bookingId:int}",
            async Task<Results<NoContent, BadRequest<string>, ForbidHttpResult, ValidationProblem>> (
                IDeleteBookingCommand deleteBookingCommand,
                int bookingId) =>
            {
                var deleteBookingRequest = new DeleteBookingRequest
                {
                    BookingId = bookingId
                };

                return await HandleResponse(
                    async () => await deleteBookingCommand.Handle(deleteBookingRequest));
            });
    }
}