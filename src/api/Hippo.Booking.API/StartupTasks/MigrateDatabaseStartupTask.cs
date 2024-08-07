using Hippo.Booking.Infrastructure.EF;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.API.StartupTasks;

public class MigrateDatabaseStartupTask(HippoBookingDbContext dbContext, IWebHostEnvironment environment) : IStartupTask
{
    public async Task Execute()
    {
        if (environment.IsEnvironment("IntegrationTest"))
        {
            await dbContext.Database.EnsureDeletedAsync();
        }

        await dbContext.Database.MigrateAsync();
    }
}