using Hippo.Booking.Application.Models;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Queries.Locations;

public class LocationQueries(IDataContext dataContext) : ILocationQueries
{
    public Task<List<IdName<int>>> GetLocations()
    {
        return dataContext.Query<Location>(x => x.WithNoTracking())
            .Select(x => new IdName<int>
            {
                Id = x.Id,
                Name = x.Name
            })
            .ToListAsync();
    }

    public Task<LocationQueryResponse?> GetLocationById(int id)
    {
        return dataContext.Query<Location>(x => x.WithNoTracking())
            .Include(i => i.Areas)
            .Where(x => x.Id == id)
            .Select(x => new LocationQueryResponse
            {
                Id = x.Id,
                Name = x.Name,
                Areas = x.Areas.Select(y => new LocationQueryResponse.AreaResponse
                {
                    Id = y.Id,
                    Name = y.Name
                }).ToList()
            })
            .SingleOrDefaultAsync();
    }
}