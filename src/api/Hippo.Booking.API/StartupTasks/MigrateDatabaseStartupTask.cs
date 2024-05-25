using Hippo.Booking.Infrastructure;
using Hippo.Booking.Infrastructure.EF;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.API.StartupTasks;

public class MigrateDatabaseStartupTask : IStartupTask
{
    private readonly HippoBookingDbContext _dbContext;

    public MigrateDatabaseStartupTask(HippoBookingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Execute()
    {
        await _dbContext.Database.MigrateAsync();
    }
}