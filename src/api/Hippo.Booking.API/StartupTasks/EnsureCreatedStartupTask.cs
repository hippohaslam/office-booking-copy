using Hippo.Booking.Infrastructure.EF;

namespace Hippo.Booking.API.StartupTasks;

public class EnsureCreatedStartupTask(HippoBookingDbContext dbContext) : IStartupTask
{
    public async Task Execute()
    {
        await dbContext.Database.EnsureCreatedAsync();
    }
}