using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Infrastructure.Slack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Hippo.Booking.Infrastructure.Scheduling;

public class SlackBookingTomorrowAlert(
    IDataContext dataContext, 
    SlackClient slackClient,
    IDateTimeProvider dateTimeProvider,
    ILogger<SlackBookingTomorrowAlert> logger) : BaseSlackConfirmationNotification(slackClient), IScheduledTask
{
    public async Task RunTask()
    {
        var tomorrow = dateTimeProvider.Today.AddDays(1);

        var usersBookedTomorrow = await dataContext.Query<Core.Entities.Booking>()
            .Include(i => i.User)
            .Where(x => x.Date == tomorrow)
            .Select(x => new
            {
                User = x.User,
                Location =
                    $"{x.BookableObject.Name} - {x.BookableObject.Area.Name} - {x.BookableObject.Area.Location.Name}"
            })
            .ToListAsync();
        
        foreach (var booking in usersBookedTomorrow)
        {
            var userId = await SlackClient.GetUserIdByEmail(booking.User.Email);
            if (userId == null)
            {
                logger.LogWarning("User {0} not found in Slack", booking.User.Email);
                continue;
            }

            await SendConfirmationMessage("Don't forget you have a booking *tomorrow*!", booking.Location, userId);
        }
    }
}