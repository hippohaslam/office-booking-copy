using Hippo.Booking.Application.Models;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Queries.Locations;

public interface IAreaQueries
{
    Task<List<AreaListResponse>> GetAreas(int locationId);

    Task<AreaQueryResponse?> GetAreaById(int locationId, int id);
}

public class AreaQueries(IDataContext dataContext) : IAreaQueries
{
    public Task<List<AreaListResponse>> GetAreas(int locationId)
    {
        return dataContext.Query<Area>(x => x.WithNoTracking())
            .Where(x => x.LocationId == locationId)
            .Select(x => new AreaListResponse
            {
                Id = x.Id,
                Name = x.Name,
                AreaTypeId = x.AreaTypeId
            })
            .ToListAsync();
    }

    public Task<AreaQueryResponse?> GetAreaById(int locationId, int id)
    {
        return dataContext.Query<Area>(x => x.WithNoTracking())
            .Include(i => i.BookableObjects)
            .Where(x => x.Id == id && x.LocationId == locationId)
            .Select(x => new AreaQueryResponse
            {
                Id = x.Id,
                Name = x.Name,
                AreaTypeId = x.AreaTypeId,
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