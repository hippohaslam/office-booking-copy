using Cronos;
using Hippo.Booking.Application.Queries.Scheduling;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Core.Models;

namespace Hippo.Booking.API.HostedServices;

public class SchedulingWorkerService(
    ILogger<SchedulingWorkerService> logger,
    IServiceProvider serviceProvider)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        using var backgroundTaskScope = serviceProvider.CreateScope();

        var scheduledTaskQueries = backgroundTaskScope.ServiceProvider.GetRequiredService<IScheduledTaskQueries>();
        var exclusiveLockProvider = backgroundTaskScope.ServiceProvider.GetRequiredService<IExclusiveLockProvider>();

        while (!cancellationToken.IsCancellationRequested)
        {
            var schedules = await scheduledTaskQueries.GetScheduledTasks();

            if (schedules.Count == 0)
            {
                logger.LogInformation("No schedules found, will check in 1 hour");
                await Task.Delay(TimeSpan.FromHours(1), cancellationToken);
                continue;
            }

            var nowUtc = DateTime.UtcNow;

            var nextSchedule = schedules
                .OrderBy(x => CronExpression.Parse(x.CronExpression).GetNextOccurrence(nowUtc))
                .First();

            var timeUntilNextRun = CronExpression.Parse(nextSchedule.CronExpression).GetNextOccurrence(nowUtc);

            if (timeUntilNextRun == null)
            {
                throw new InvalidOperationException("Cron expression is invalid");
            }

            var timeSpan = timeUntilNextRun.Value - nowUtc;

            logger.LogInformation("Scheduled task {0} is set to run in {1}. Waiting for next run.", nextSchedule.Task, timeSpan);

            await Task.Delay(timeSpan, cancellationToken);

            await RunTask(nextSchedule, exclusiveLockProvider, cancellationToken);
        }

        logger.LogWarning("Scheduled worker has stopped");
    }

    private async Task RunTask(ScheduledTaskResponse schedule, IExclusiveLockProvider exclusiveLockProvider, CancellationToken cancellationToken)
    {
        if (!await exclusiveLockProvider.GetExclusiveLock(schedule.Task, TimeSpan.FromMinutes(5), cancellationToken))
        {
            logger.LogWarning("Could not acquire lock for task {0}", schedule.Task);
            return;
        }

        using var scope = serviceProvider.CreateScope();

        var scheduledTask = scope.ServiceProvider.GetKeyedService<IScheduledTask>(schedule.Task);

        if (scheduledTask == null)
        {
            logger.LogError("Scheduled task {Task} not found", schedule.Task);
            return;
        }

        logger.LogInformation("Running scheduled task {0}", schedule.Task);

        await scheduledTask.RunTask(new ScheduleContext(schedule.PayloadJson));

        await exclusiveLockProvider.ReleaseExclusiveLock(schedule.Task, cancellationToken);
    }
}