using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Core.Interfaces;

public interface IDataContext
{
    IQueryable<TEntity> Query<TEntity>(Action<QueryOptions>? options = null) where TEntity : class;

    DbSet<TEntity> Set<TEntity>() where TEntity : class;

    Task Save();
    
    void AddEntity<TEntity>(TEntity entity) where TEntity : class;
}