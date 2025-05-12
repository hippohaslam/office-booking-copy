using Hangfire;
using Hippo.Booking.Application.Commands.Bookings;
using Hippo.Booking.Application.Consumers;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Core.Models;
using Hippo.Booking.Infrastructure.Slack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SlackNet.WebApi;

namespace Hippo.Booking.Infrastructure.Scheduling;

public class CancelUnconfirmedBookingsScheduledTask(
    IDataContext dataContext,
    IDateTimeProvider dateTimeProvider,
    ISlackClient slackClient,
    IBackgroundJobClient backgroundJobClient,
    ILogger<SlackConfirmationScheduledTask> logger) : IScheduledTask
{
    public async Task RunTask(ScheduleContext scheduleContext)
    {
        var dateToCheck = dateTimeProvider.Today;

        var usersToCancel = await dataContext.Query<Core.Entities.Booking>()
            .Include(i => i.User)
            .Include(i => i.BookableObject)
            .Where(x => x.Date == dateToCheck && !x.IsConfirmed)
            .ToListAsync();

        logger.LogDebug("Found {Count} bookings for task", usersToCancel.Count);

        foreach (var booking in usersToCancel)
        {
            try
            {
                var userId = await slackClient.GetUserIdByEmail(booking.User.Email);
                
                if (userId == null)
                {
                    logger.LogWarning("User {Email} not found in Slack", booking.User.Email);
                    continue;
                }
                
                if (!string.IsNullOrEmpty(booking.LastSlackMessageId))
                {
                    logger.LogDebug("Deleting last message for booking {BookingId}", booking.Id);
                    await slackClient.DeleteMessage(booking.LastSlackMessageId, userId);
                }
                
                dataContext.DeleteEntity(booking);
                await dataContext.Save();
                
                backgroundJobClient.Enqueue<BookingConsumer>(
                    x => x.HandleAsync(new BookingCancelledRequest
                    {
                        BookableObjectId = booking.BookableObjectId,
                        AreaId = booking.BookableObject.AreaId,
                        Date = booking.Date,
                        UserEmail = booking.User.Email,
                        CalendarEventId = booking.CalendarEventId
                    }));

                var dateString = booking.Date.ToString("dddd d MMMM yyyy");

                var message = new Message
                {
                    Channel = userId,
                    Text = $"Your booking for *{booking.BookableObject.Name}* on *{dateString}* was not confirmed so has been automatically cancelled"
                };

                await slackClient.SendMessage(message);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error cancelling booking {BookingId}", booking.Id);
            }
        }
    }
}