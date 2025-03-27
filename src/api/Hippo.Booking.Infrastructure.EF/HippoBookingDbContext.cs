using System.Reflection;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Extensions;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Infrastructure.EF;

public class HippoBookingDbContext(
    DbContextOptions<HippoBookingDbContext> options,
    IUserProvider userProvider,
    IDateTimeProvider dateTimeProvider) : DbContext(options), IDataContext
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

        if (typeof(TEntity).IsImplementationOf<ISoftDelete>())
        {
            query = query.Where(x => !((ISoftDelete)x).DeletedAt.HasValue);
        }

        return query;
    }

    public Task Save()
    {
        return SaveChangesAsync();
    }

    public void AddEntity<TEntity>(TEntity entity) where TEntity : class
    {
        if (typeof(TEntity).IsImplementationOf<ICreatedBy>())
        {
            ((ICreatedBy)entity).CreatedAt = dateTimeProvider.UtcNow;
            ((ICreatedBy)entity).CreatedBy = userProvider.GetCurrentUser()?.UserId ?? "System";
        }
        
        Set<TEntity>().Add(entity);
    }

    public void DeleteEntity<TEntity>(TEntity entity) where TEntity : class
    {
        if (typeof(TEntity).IsImplementationOf<ISoftDelete>())
        {
            ((ISoftDelete)entity).DeletedAt = dateTimeProvider.UtcNow;
            ((ISoftDelete)entity).DeletedBy = userProvider.GetCurrentUser()?.UserId ?? "System";
        }
        else
        {
            Set<TEntity>().Remove(entity);
        }
    }
    
    public void DeleteEntities<TEntity>(IEnumerable<TEntity> entities) where TEntity : class
    {
        foreach (var entity in entities)
        {
            DeleteEntity(entity);
        }
    }

    public DbSet<User> Users { get; set; } = null!;

    public DbSet<BookableObject> BookableObjects { get; set; } = null!;

    public DbSet<BookableObjectType> BookableObjectTypes { get; set; } = null!;

    public DbSet<Core.Entities.Booking> Bookings { get; set; } = null!;

    public DbSet<Location> Locations { get; set; } = null!;

    public DbSet<Area> Areas { get; set; } = null!;

    public DbSet<AreaType> AreaTypes { get; set; } = null!;

    public DbSet<ScheduledTask>? ScheduledTasks { get; set; }

    public DbSet<BookingWaitList> BookingWaitLists { get; set; } = null!;
    
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