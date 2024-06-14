using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Infrastructure.EF;

public class HippoBookingDbContext(DbContextOptions<HippoBookingDbContext> options) : DbContext(options), IDataContext
{
    public IQueryable<TEntity> Query<TEntity>(Action<QueryOptions>? options = null) where TEntity : class
    { 
        var queryOptions = new QueryOptions();
        
        options?.Invoke(queryOptions);

        var query = Set<TEntity>().AsQueryable();

        if (queryOptions.NoTracking)
        {
            query = query.AsNoTracking();
        }

        if (queryOptions.SplitQuery)
        {
            query = query.AsSplitQuery();
        }

        return query;
    }

    public Task Save()
    {
        return SaveChangesAsync();
    }

    public DbSet<User>? Users { get; set; }
    
    public DbSet<BookableObject>? BookableObjects { get; set; }
    
    public DbSet<Core.Entities.Booking>? Bookings { get; set; }
    
    public DbSet<Location>? Locations { get; set; }
}