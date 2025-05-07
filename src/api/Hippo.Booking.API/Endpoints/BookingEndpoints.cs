using Hippo.Booking.API.Extensions;
using Hippo.Booking.Application.Commands.Bookings;
using Hippo.Booking.Application.Queries.Bookings;
using Hippo.Booking.Core.Enums;
using Hippo.Booking.Core.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hippo.Booking.API.Endpoints;

public class BookingEndpoints() : EndpointBase("booking", "Bookings", AccessLevelEnum.User)
{
    protected override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("{bookingId:int}",
            async Task<Results<Ok<BookingResponse>, NotFound>> (IBookingQueries bookingQueries, int bookingId) =>
            {
                var booking = await bookingQueries.GetBookingById(bookingId);

                if (booking == null)
                {
                    return TypedResults.NotFound();
                }

                return TypedResults.Ok(booking);
            });
        
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

        builder.MapGet("",
            async Task<Results<Ok<List<UserBookingsResponse>>, UnauthorizedHttpResult>> (IBookingQueries bookingQueries,
                HttpContext httpContext, DateOnly from, DateOnly to) =>
            {
                var userId = httpContext.GetUserId();

                var bookings = await bookingQueries.GetAllBookingsForUserBetweenDates(userId, from, to);

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

        builder.MapPost("",
            async (
                ICreateBookingCommand createBookingCommand,
                CreateBookingRequest request,
                IUserProvider userProvider) =>
            {
                var user = userProvider.GetCurrentUser();
                
                if (user == null)
                {
                    return TypedResults.Unauthorized();
                }
                
                request.UserId = user.UserId;
                request.UserEmail = user.Email;
                
                return await HandleCreatedResponse(
                    async () => await createBookingCommand.Handle(request),
                    x => $"booking/{x.Id}");
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