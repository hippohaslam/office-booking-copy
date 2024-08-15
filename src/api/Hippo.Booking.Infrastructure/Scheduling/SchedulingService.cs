using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Hippo.Booking.Infrastructure.Scheduling;

public class SchedulingService(
    ILogger<SchedulingService> logger,
    IServiceProvider serviceProvider,
    IDateTimeProvider dateTimeProvider)
{
    public async Task Run(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            using var scope = serviceProvider.CreateScope();
            var dataContext = scope.ServiceProvider.GetRequiredService<IDataContext>();
            
            var schedules = await dataContext
                .Query<ScheduledTask>(x => x.WithNoTracking())
                .ToListAsync(cancellationToken);

            if (schedules.Count == 0)
            {
                logger.LogInformation("No schedules found, will check in 1 hour");
                await Task.Delay(TimeSpan.FromHours(1), cancellationToken);
                continue;
            }

            // Everything is UK time on purpose so the schedules don't shift during daylight savings
            // we can revisit if Hippo go Global :D
            var nowUkLocal =
                TimeZoneInfo.ConvertTimeFromUtc(dateTimeProvider.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Europe/London"));

            var nextSchedule = schedules
                .OrderBy(x => (x.TimeToRun - TimeOnly.FromDateTime(nowUkLocal)))
                .First();
            
            var timeSpan = nextSchedule.TimeToRun - TimeOnly.FromDateTime(nowUkLocal);

            logger.LogInformation("Scheduled task {0} is set to run in {1}. Waiting for next run.", nextSchedule.Task, timeSpan);

            await Task.Delay(timeSpan, cancellationToken);

            await RunTask(nextSchedule.Id, cancellationToken);
        }

        logger.LogWarning("Scheduled worker has stopped");
    }

    private async Task RunTask(int taskId, CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var dataContext = scope.ServiceProvider.GetRequiredService<IDataContext>();

        var scheduledTaskEntry = await dataContext.Query<ScheduledTask>()
            .SingleOrDefaultAsync(x => x.Id == taskId, cancellationToken: cancellationToken);
        
        if (scheduledTaskEntry == null)
        {
            logger.LogError("Scheduled task {Task} not found", taskId);
            return;
        }

        if (scheduledTaskEntry.LastRunDate >= dateTimeProvider.Today)
        {
            logger.LogWarning("Scheduled task {Task} has already run today", scheduledTaskEntry.Task);
            return;
        }

        try
        {
            scheduledTaskEntry.LastRunDate = dateTimeProvider.Today;
            await dataContext.Save();
        }
        catch (DbUpdateConcurrencyException)
        {
            logger.LogWarning("Scheduled task {Task} has already run today. Another service picked it up before this service could claim it.", scheduledTaskEntry.Task);
            return;
        }
        
        var scheduledTask = scope.ServiceProvider.GetKeyedService<IScheduledTask>(scheduledTaskEntry.Task);

        if (scheduledTask == null)
        {
            logger.LogError("Scheduled task {Task} not found", scheduledTaskEntry.Task);
            return;
        }

        logger.LogInformation("Running scheduled task {0}", scheduledTaskEntry.Task);

        await scheduledTask.RunTask(new ScheduleContext(scheduledTaskEntry.PayloadJson));
    }
}