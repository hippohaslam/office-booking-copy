using Hippo.Booking.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace Hippo.Booking.Infrastructure.Scheduling;

public class TestScheduledTask(ILogger<TestScheduledTask> logger) : IScheduledTask
{
    public Task RunTask()
    {
        logger.LogInformation("Scheduled task executed");

        return Task.CompletedTask;
    }
}