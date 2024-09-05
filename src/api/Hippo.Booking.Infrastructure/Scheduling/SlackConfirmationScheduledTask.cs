using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Core.Models;
using Hippo.Booking.Infrastructure.Slack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Hippo.Booking.Infrastructure.Scheduling;

public class SlackConfirmationScheduledTask(
    IDataContext dataContext,
    ISlackClient slackClient,
    IDateTimeProvider dateTimeProvider,
    ILogger<SlackConfirmationScheduledTask> logger) : BaseSlackConfirmationNotification(slackClient), IScheduledTask
{
    public async Task RunTask(ScheduleContext scheduleContext)
    {
        var settings = scheduleContext.GetPayload<SlackAlertParameters>();

        var dateToCheck = dateTimeProvider.Today.AddDays(settings.DayOffset);

        var usersToNotify = await dataContext.Query<Core.Entities.Booking>()
            .Include(i => i.User)
            .Include(i => i.BookableObject)
            .ThenInclude(i => i.Area)
            .ThenInclude(i => i.Location)
            .Where(x => x.Date == dateToCheck && !x.IsConfirmed)
            .ToListAsync();

        logger.LogDebug("Found {Count} bookings for task", usersToNotify.Count);

        foreach (var booking in usersToNotify)
        {
            try
            {
                var userId = await SlackClient.GetUserIdByEmail(booking.User.Email);
                if (userId == null)
                {
                    logger.LogWarning("User {Email} not found in Slack", booking.User.Email);
                    continue;
                }
                
                if (!string.IsNullOrEmpty(booking.LastSlackMessageId))
                {
                    logger.LogDebug("Deleting last message for booking {BookingId}", booking.Id);
                    await SlackClient.DeleteMessage(booking.LastSlackMessageId, userId);
                }

                var location =
                    $"{booking.BookableObject.Name} - {booking.BookableObject.Area.Name} - {booking.BookableObject.Area.Location.Name}";

                var messageId = await SendConfirmationMessage(settings.Message,
                    location,
                    userId,
                    booking.Id);

                booking.LastSlackMessageId = messageId;

                await dataContext.Save();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error sending slack message for booking {BookingId}", booking.Id);
            }
        }
    }
}