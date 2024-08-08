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
            .Where(x => x.Date == dateToCheck)
            .Select(x => new
            {
                Id = x.Id,
                User = x.User,
                Location =
                    $"{x.BookableObject.Name} - {x.BookableObject.Area.Name} - {x.BookableObject.Area.Location.Name}"
            })
            .ToListAsync();

        logger.LogDebug("Found {0} bookings for task", usersToNotify.Count);

        foreach (var booking in usersToNotify)
        {
            var userId = await SlackClient.GetUserIdByEmail(booking.User.Email);
            if (userId == null)
            {
                logger.LogWarning("User {0} not found in Slack", booking.User.Email);
                continue;
            }

            await SendConfirmationMessage(settings.Message,
                booking.Location,
                userId,
                booking.Id);
        }
    }
}