using Hangfire;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Infrastructure.Scheduling;

namespace Hippo.Booking.API.StartupTasks;

public class HangfireStartupTask(
    IRecurringJobManager recurringJobManager,
    ICancelTimedOutBookingWaitingLists job) : IStartupTask
{
    public Task Execute()
    {
        
        recurringJobManager.AddOrUpdate("cancel-timed-out-booking-waiting-lists", () => job.RunTask(),
            Cron.Daily(8, 30), 
           options: new RecurringJobOptions {
                TimeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/London")
            });

        return Task.CompletedTask;
    }
}