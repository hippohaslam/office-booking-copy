
using Hippo.Booking.Application.Commands.Bookings;
using Hippo.Booking.Application.Commands.BookingWaitList;
using Hippo.Booking.Application.Queries.BookingWaitingList;
using Microsoft.Extensions.Logging;

namespace Hippo.Booking.Application.Consumers;

public class BookingConsumer(
    ICreateBookingCommand bookingCommand, 
    IBookingWaitingListQueries bookingWaitingListQueries,
    IDeleteBookingWaitListCommands deleteBookingWaitListCommands,
    ILogger<BookingConsumer> logger)
{
    public async Task HandleAsync(BookFromWaitListRequest data)
    {   
        var waitListUser = await bookingWaitingListQueries.GetNextOnWaitingListAsync(data.AreaId, data.Date);

        if (waitListUser is null)
        {
            logger.LogInformation("BookingConsumer returned no users on waiting list");
            return;
        }

        logger.LogInformation("BookingConsumer started for user {UserId}", waitListUser.UserId);
        await bookingCommand.Handle(new CreateBookingRequest
        {
            BookableObjectId = data.BookableObjectId,
            AreaId = data.AreaId,
            Date = data.Date,
            UserId = waitListUser.UserId
        });
            
        logger.LogInformation("BookingConsumer finished creating booking for user {UserId}", waitListUser.UserId);
            
        await deleteBookingWaitListCommands.Handle(waitListUser.UserId, waitListUser.Id);
        logger.LogInformation("BookingConsumer removed user {UserId} from waiting list", waitListUser.UserId);
    }
}