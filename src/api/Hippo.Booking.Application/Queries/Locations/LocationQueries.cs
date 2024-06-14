using Hippo.Booking.Application.Models;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Queries.Locations;

public interface ILocationQueries
{
    Task<List<LocationListQueryResponse>> GetLocations();

    Task<LocationQueryResponse?> GetLocationById(int id);
}

public class LocationQueries(IDataContext dataContext) : ILocationQueries
{
    public Task<List<LocationListQueryResponse>> GetLocations()
    {
        return dataContext.Query<Location>(x => x.WithNoTracking())
            .Select(x => new LocationListQueryResponse
            {
                Id = x.Id,
                Name = x.Name
            })
            .ToListAsync();
    }

    public Task<LocationQueryResponse?> GetLocationById(int id)
    {
        return dataContext.Query<Location>(x => x.WithNoTracking())
            .Include(i => i.BookableObjects)
            .Where(x => x.Id == id)
            .Select(x => new LocationQueryResponse
            {
                Id = x.Id,
                Name = x.Name,
                FloorPlanJson = x.FloorPlanJson,
                BookableObjects = x.BookableObjects.Select(y => new BookableObjectDto
                {
                    Id = y.Id,
                    Name = y.Name,
                    Description = y.Description,
                    FloorPlanObjectId = y.FloorplanObjectId
                }).ToList()
            })
            .SingleOrDefaultAsync();
    }
}