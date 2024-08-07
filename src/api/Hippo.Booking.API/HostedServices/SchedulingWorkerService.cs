using Cronos;
using Hippo.Booking.Application.Queries.Scheduling;
using Hippo.Booking.Core.Interfaces;

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

            await RunTask(nextSchedule.Task, exclusiveLockProvider, cancellationToken);
        }

        logger.LogWarning("Scheduled worker has stopped");
    }

    private async Task RunTask(string task, IExclusiveLockProvider exclusiveLockProvider, CancellationToken cancellationToken)
    {
        if (!await exclusiveLockProvider.GetExclusiveLock(task, TimeSpan.FromMinutes(5), cancellationToken))
        {
            logger.LogWarning("Could not acquire lock for task {0}", task);
            return;
        }

        using var scope = serviceProvider.CreateScope();

        var scheduledTask = scope.ServiceProvider.GetKeyedService<IScheduledTask>(task);

        if (scheduledTask == null)
        {
            throw new InvalidOperationException("Scheduled task not found");
        }

        logger.LogInformation("Running scheduled task {0}", task);

        await scheduledTask.RunTask();

        await exclusiveLockProvider.ReleaseExclusiveLock(task, cancellationToken);
    }
}