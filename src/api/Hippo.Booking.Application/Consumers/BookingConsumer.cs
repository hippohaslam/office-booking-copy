
using Hippo.Booking.Application.Commands.Bookings;
using Hippo.Booking.Application.Commands.BookingWaitList;
using Hippo.Booking.Application.Queries.BookingWaitingList;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Hippo.Booking.Application.Consumers;

public class BookingConsumer(
    ICreateBookingCommand bookingCommand, 
    IBookingWaitingListQueries bookingWaitingListQueries,
    IDeleteBookingWaitListCommands deleteBookingWaitListCommands,
    IBookingCalendar bookingCalendar,
    ILogger<BookingConsumer> logger,
    IDataContext dataContext)
{
    public async Task HandleAsync(BookingCreatedRequest data)
    {
        try
        {
            var booking = await dataContext.Query<Core.Entities.Booking>()
                .Include(i => i.BookableObject)
                .ThenInclude(i => i.Area)
                .ThenInclude(i => i.Location)
                .Include(i => i.User)
                .SingleOrDefaultAsync(x => x.Id == data.BookingId);
            
            if (booking == null)
            {
                logger.LogError("BookingConsumer booking not found for id {BookingId}", data.BookingId);
                return;
            }
            
            var summary =
                $"{booking.BookableObject.Name} - {booking.BookableObject.Area.Name} - {booking.BookableObject.Area.Location.Name}";

            var calendarEventId = await bookingCalendar.CreateBookingEvent(booking.User.Email, summary, booking.Date);
            booking.CalendarEventId = calendarEventId;

            await dataContext.Save();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating booking event");
        }
    }
    
    public async Task HandleAsync(BookingCancelledRequest data)
    {   
        try
        {
            if (data.CalendarEventId != null)
            {
                await bookingCalendar.DeleteBookingEvent(data.UserEmail, data.CalendarEventId);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting booking event: " + data.CalendarEventId);
        }
        
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