using Hippo.Booking.Application.Models;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Queries.Offices;

public interface IOfficeQueries
{
    Task<List<OfficeListQueryResponse>> GetOffices();

    Task<OfficeQueryResponse?> GetOfficeById(int id);
}


public class OfficeQueries(IDataContext dataContext) : IOfficeQueries
{
    public Task<List<OfficeListQueryResponse>> GetOffices()
    {
        return dataContext.Query<Office>(x => x.WithNoTracking())
            .Select(x => new OfficeListQueryResponse
            {
                Id = x.Id,
                Name = x.Name
            })
            .ToListAsync();
    }

    public Task<OfficeQueryResponse?> GetOfficeById(int id)
    {
        return dataContext.Query<Office>(x => x.WithNoTracking())
            .Include(i => i.BookableObjects)
            .Where(x => x.Id == id)
            .Select(x => new OfficeQueryResponse
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