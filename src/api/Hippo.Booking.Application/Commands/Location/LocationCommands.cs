using FluentValidation;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Commands.Location;

public class LocationCommands(
    IDataContext dataContext,
    IValidator<CreateLocationRequest> createLocationRequestValidator,
    IValidator<UpdateLocationRequest> updateLocationRequestValidator) :
    ICreateLocationCommmand,
    IUpdateLocationCommand
{
    public async Task<int> Handle(CreateLocationRequest request)
    {
        await createLocationRequestValidator.ValidateAndThrowAsync(request);
        
        var isExistingLocation = await dataContext
            .Query<Core.Entities.Location>(x => x.WithNoTracking())
            .AnyAsync(x => x.Name == request.Name);

        if (isExistingLocation)
        {
            throw new ClientException("Location already exists");
        }

        var location = new Core.Entities.Location
        {
            Name = request.Name
        };

        dataContext.Set<Core.Entities.Location>().Add(location);

        await dataContext.Save();

        return location.Id;
    }

    public async Task Handle(int id, UpdateLocationRequest request)
    {
        await updateLocationRequestValidator.ValidateAndThrowAsync(request);
        
        var location = await dataContext.Query<Core.Entities.Location>()
            .SingleOrDefaultAsync(x => x.Id == id);

        if (location is null)
        {
            throw new ClientException("Location not found");
        }

        location.Name = request.Name;
        location.FloorPlanJson = request.FloorPlanJson;
        
        await dataContext.Save();
    }
}