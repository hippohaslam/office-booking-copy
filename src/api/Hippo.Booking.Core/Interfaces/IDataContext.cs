namespace Hippo.Booking.Core.Interfaces;

public interface IDataContext
{
    IQueryable<TEntity> Query<TEntity>(Action<QueryOptions>? options = null) where TEntity : class;
}