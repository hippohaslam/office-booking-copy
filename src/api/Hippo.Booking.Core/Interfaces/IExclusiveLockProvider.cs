namespace Hippo.Booking.Core.Interfaces;

public interface IExclusiveLockProvider
{
    Task<bool> GetExclusiveLock(string lockName, TimeSpan lockTimeout, CancellationToken cancellationToken = default);

    Task ReleaseExclusiveLock(string lockName, CancellationToken cancellationToken = default);
}