using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Commands.BookableObject;

public class BookableObjectCommands(IDataContext dataContext) : ICreateBookableObject, IUpdateBookableObject
{
    public async Task<int> Handle(int officeId, CreateBookableObjectRequest request)
    {
        var office = await dataContext.Query<Core.Entities.Office>()
            .Include(i => i.BookableObjects)
            .SingleOrDefaultAsync(x => x.Id == officeId);

        if (office == null)
        {
            throw new ClientException("Office not found");
        }
        
        if (office.BookableObjects.Any(x => x.Name == request.Name))
        {
            throw new ClientException("Bookable object with this name already exists in this office.");
        }
        
        var bookableObject = new Core.Entities.BookableObject
        {
            Name = request.Name,
            Description = request.Description,
            FloorplanObjectId = request.FloorPlanObjectId,
            OfficeId = officeId
        };
        
        office.BookableObjects.Add(bookableObject);

        await dataContext.Save();

        return bookableObject.Id;
    }

    public async Task Handle(int bookableObjectId, int officeId, UpdateBookableObjectRequest request)
    {
        var office = await dataContext.Query<Core.Entities.Office>()
            .Include(i => i.BookableObjects)
            .SingleOrDefaultAsync(x => x.Id == officeId);

        if (office == null)
        {
            throw new ClientException("Office not found");
        }

        var bookableObject = office.BookableObjects.SingleOrDefault(x => x.Id == bookableObjectId);
        
        if (bookableObject == null)
        {
            throw new ClientException("Bookable object with this name already exists in this office.");
        }
        
        bookableObject.Name = request.Name;
        bookableObject.Description = request.Description;
        bookableObject.FloorplanObjectId = request.FloorPlanObjectId;
        
        await dataContext.Save();
    }
}