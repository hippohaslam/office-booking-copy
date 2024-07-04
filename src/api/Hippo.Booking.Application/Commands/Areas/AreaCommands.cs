using FluentValidation;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Commands.Areas;

public class AreaCommands(
    IDataContext dataContext,
    IValidator<CreateAreaRequest> createAreaRequestValidator,
    IValidator<UpdateAreaRequest> updateAreaRequestValidator) :
    ICreateAreaCommand,
    IUpdateAreaCommand
{
    public async Task<int> Handle(int locationId, CreateAreaRequest request)
    {
        await createAreaRequestValidator.ValidateAndThrowAsync(request);
        
        var locationExists = await dataContext.Query<Core.Entities.Location>()
            .AnyAsync(x => x.Id == locationId);

        if (!locationExists)
        {
            throw new ClientException($"Location id {locationId} not found.");
        }
        
        var isExistingLocation = await dataContext
            .Query<Area>(x => x.WithNoTracking())
            .AnyAsync(x => x.Name == request.Name && x.LocationId == locationId);

        if (isExistingLocation)
        {
            throw new ClientException("Area already exists");
        }

        var area = new Area
        {
            Name = request.Name,
            Description = request.Description,
            LocationId = locationId
        };

        dataContext.Set<Area>().Add(area);

        await dataContext.Save();

        return area.Id;
    }

    public async Task Handle(int locationId, int id, UpdateAreaRequest request)
    {
        await updateAreaRequestValidator.ValidateAndThrowAsync(request);
        
        var location = await dataContext.Query<Area>()
            .SingleOrDefaultAsync(x => x.Id == id && x.LocationId == locationId);

        if (location is null)
        {
            throw new ClientException("Location not found");
        }

        location.Name = request.Name;
        location.FloorPlanJson = request.FloorPlanJson;
        
        await dataContext.Save();
    }
}