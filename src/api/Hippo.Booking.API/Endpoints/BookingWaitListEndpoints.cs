using Hippo.Booking.API.Extensions;
using Hippo.Booking.Application.Commands.BookingWaitList;
using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Application.Queries.BookingWaitingList;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Enums;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hippo.Booking.API.Endpoints;

public class BookingWaitListEndpoints() : EndpointBase("booking/waitlist", "Booking Wait List", AccessLevelEnum.User)
{
    protected override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("{id:int}", async Task<Results<Ok<BookingWaitListResponse>, NotFound>> (IBookingWaitingListQueries bookingWaitListQueries, HttpContext context, int id) =>
        {
            var userId = context.GetUserId();
            var result = await bookingWaitListQueries.FindUserInBookingWaitListAsync(userId, id);
            if (result is null)
            {
                return TypedResults.NotFound();
            }
            return TypedResults.Ok(result);
        });
        
        builder.MapPost("", 
            async (ICreateBookingWaitListCommands createBookingWaitListCommands, HttpContext httpContext, AddToWaitListRequest request) =>
            {
                var userId = httpContext.GetUserId();
                
                return await HandleCreatedResponse(async () => await createBookingWaitListCommands.Handle(userId, request)
                , id => $"booking/waitlist/{id}");
            });


        builder.MapDelete("{id:int}",
            async (IDeleteBookingWaitListCommands deleteBookingWaitListCommands, HttpContext httpContext, int id) =>
            {
                var userId = httpContext.GetUserId();

                return await HandleResponse(async () => await deleteBookingWaitListCommands.Handle(userId, id));
            });
    }
}