using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Commands.BookableObject;

public class BookableObjectCommands(IDataContext dataContext) : ICreateBookableObject, IUpdateBookableObject
{
    public async Task<int> Handle(int locationId, int areaId, CreateBookableObjectRequest request)
    {
        var area = await dataContext.Query<Area>()
            .Include(i => i.BookableObjects)
            .SingleOrDefaultAsync(x => x.LocationId == locationId && x.Id == areaId);

        if (area == null)
        {
            throw new ClientException("Area not found");
        }

        if (area.BookableObjects.Any(x => x.Name == request.Name))
        {
            throw new ClientException("Bookable object with this name already exists in this area.");
        }

        var bookableObject = new Core.Entities.BookableObject
        {
            Name = request.Name,
            Description = request.Description,
            FloorplanObjectId = request.FloorPlanObjectId,
            AreaId = areaId
        };

        area.BookableObjects.Add(bookableObject);

        await dataContext.Save();

        return bookableObject.Id;
    }

    public async Task Handle(int bookableObjectId, int locationId, int areaId, UpdateBookableObjectRequest request)
    {
        var bookableObject = await dataContext.Query<Core.Entities.BookableObject>()
            .Include(i => i.Area)
            .SingleOrDefaultAsync(x =>
                x.Id == bookableObjectId &&
                x.AreaId == areaId &&
                x.Area.LocationId == locationId);

        if (bookableObject == null)
        {
            throw new ClientException("Bookable object does not exist.");
        }

        bookableObject.Name = request.Name;
        bookableObject.Description = request.Description;
        bookableObject.FloorplanObjectId = request.FloorPlanObjectId;

        await dataContext.Save();
    }
}