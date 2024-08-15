using Hippo.Booking.Infrastructure.Scheduling;

namespace Hippo.Booking.API.HostedServices;

public class SchedulingWorkerService(
    ILogger<SchedulingWorkerService> logger,
    SchedulingService schedulingService)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        await schedulingService.Run(cancellationToken);

        logger.LogWarning("Scheduled worker has stopped");
    }
}