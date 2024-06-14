using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Commands.BookableObject;

public class BookableObjectCommands(IDataContext dataContext) : ICreateBookableObject, IUpdateBookableObject
{
    public async Task<int> Handle(int locationId, CreateBookableObjectRequest request)
    {
        var location = await dataContext.Query<Core.Entities.Location>()
            .Include(i => i.BookableObjects)
            .SingleOrDefaultAsync(x => x.Id == locationId);

        if (location == null)
        {
            throw new ClientException("Location not found");
        }
        
        if (location.BookableObjects.Any(x => x.Name == request.Name))
        {
            throw new ClientException("Bookable object with this name already exists in this location.");
        }
        
        var bookableObject = new Core.Entities.BookableObject
        {
            Name = request.Name,
            Description = request.Description,
            FloorplanObjectId = request.FloorPlanObjectId,
            LocationId = locationId
        };
        
        location.BookableObjects.Add(bookableObject);

        await dataContext.Save();

        return bookableObject.Id;
    }

    public async Task Handle(int bookableObjectId, int locationId, UpdateBookableObjectRequest request)
    {
        var location = await dataContext.Query<Core.Entities.Location>()
            .Include(i => i.BookableObjects)
            .SingleOrDefaultAsync(x => x.Id == locationId);

        if (location == null)
        {
            throw new ClientException("Location not found");
        }

        var bookableObject = location.BookableObjects.SingleOrDefault(x => x.Id == bookableObjectId);
        
        if (bookableObject == null)
        {
            throw new ClientException("Bookable object with this name already exists in this location.");
        }
        
        bookableObject.Name = request.Name;
        bookableObject.Description = request.Description;
        bookableObject.FloorplanObjectId = request.FloorPlanObjectId;
        
        await dataContext.Save();
    }
}