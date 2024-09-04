using Hippo.Booking.Core;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Infrastructure.EF;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Infrastructure.Tests;

public class TestHelpers
{
    public static IDataContext GetDbContext(string name)
    {
        var dbOptions = new DbContextOptionsBuilder<HippoBookingDbContext>()
            .UseInMemoryDatabase(name)
            .Options;

        return new HippoBookingDbContext(dbOptions, new TestUserProvider(), new SystemDateTimeProvider());
    }
}