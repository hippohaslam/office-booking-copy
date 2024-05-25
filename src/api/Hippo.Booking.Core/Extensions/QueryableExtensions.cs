using Hippo.Booking.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Core.Extensions;

public static class QueryableExtensions
{
    public static async Task<PagedList<TModel>> ToPagedListAsync<TModel>(this IQueryable<TModel> model, int page, int pageSize)
    {
        var count = await model.CountAsync();

        var items = await model
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedList<TModel>
        {
            TotalCount = count,
            Page = page,
            PageSize = pageSize,
            Items = items
        };
    }
}