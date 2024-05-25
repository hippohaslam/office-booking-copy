using Hippo.Booking.Infrastructure.EF;

namespace Hippo.Booking.API.StartupTasks;

public class EnsureCreatedStartupTask : IStartupTask
{
    private readonly HippoBookingDbContext _dbContext;

    public EnsureCreatedStartupTask(HippoBookingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Execute()
    {
        await _dbContext.Database.EnsureCreatedAsync();
    }
}