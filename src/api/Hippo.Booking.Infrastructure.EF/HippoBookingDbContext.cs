using System.Reflection;
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

    public void AddEntity<TEntity>(TEntity entity) where TEntity : class
    {
        Set<TEntity>().Add(entity);
    }

    public void DeleteEntity<TEntity>(TEntity entity) where TEntity : class
    {
        // If we do soft delete down the line, we can add it in here.

        Set<TEntity>().Remove(entity);
    }

    public DbSet<User> Users { get; set; } = null!;

    public DbSet<BookableObject> BookableObjects { get; set; } = null!;

    public DbSet<Core.Entities.Booking> Bookings { get; set; } = null!;

    public DbSet<Location> Locations { get; set; } = null!;

    public DbSet<Area> Areas { get; set; } = null!;

    public DbSet<AreaType> AreaTypes { get; set; } = null!;

    public DbSet<ScheduledTask>? ScheduledTasks { get; set; }
    
    public DbSet<Report> Reports { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var assembly = Assembly.GetAssembly(GetType());
        if (assembly != null)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(assembly);
        }
    }
}