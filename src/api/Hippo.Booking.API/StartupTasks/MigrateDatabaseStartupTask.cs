using Hippo.Booking.Infrastructure.EF;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.API.StartupTasks;

public class MigrateDatabaseStartupTask(HippoBookingDbContext dbContext) : IStartupTask
{
    public async Task Execute()
    {
        await dbContext.Database.MigrateAsync();
    }
}