using Hippo.Booking.Core.Interfaces;

namespace Hippo.Booking.Infrastructure.Scheduling;

public class NullExclusiveLockProvider : IExclusiveLockProvider
{
    public Task<bool> GetExclusiveLock(string lockName, TimeSpan lockTimeout, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(true);
    }

    public Task ReleaseExclusiveLock(string lockName, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }
}