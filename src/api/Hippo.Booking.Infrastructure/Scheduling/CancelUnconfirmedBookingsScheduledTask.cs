using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Hippo.Booking.Infrastructure.Scheduling;

public class CancelUnconfirmedBookingsScheduledTask(
    IDataContext dataContext,
    IDateTimeProvider dateTimeProvider,
    IUserNotifier userNotifier,
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
                dataContext.DeleteEntity(booking);
                await dataContext.Save();

                var dateString = booking.Date.ToString("dddd dd MMMM yyyy");

                await userNotifier.NotifyUser(booking.UserId,
                    $"Your booking for *{booking.BookableObject.Name}* on *{dateString}* was not confirmed so has been automatically cancelled");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error cancelling booking {BookingId}", booking.Id);
            }
        }
    }
}