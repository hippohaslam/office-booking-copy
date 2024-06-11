using FluentValidation;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Commands.Office;

public class OfficeCommands(
    IDataContext dataContext,
    IValidator<CreateOfficeRequest> createOfficeRequestValidator,
    IValidator<UpdateOfficeRequest> updateOfficeRequestValidator) :
    ICreateOfficeCommmand,
    IUpdateOfficeCommand
{
    public async Task<int> Handle(CreateOfficeRequest request)
    {
        await createOfficeRequestValidator.ValidateAndThrowAsync(request);
        
        var isExistingOffice = await dataContext
            .Query<Core.Entities.Office>(x => x.WithNoTracking())
            .AnyAsync(x => x.Name == request.Name);

        if (isExistingOffice)
        {
            throw new ClientException("Office already exists");
        }

        var office = new Core.Entities.Office
        {
            Name = request.Name
        };

        dataContext.Set<Core.Entities.Office>().Add(office);

        await dataContext.Save();

        return office.Id;
    }

    public async Task Handle(int id, UpdateOfficeRequest request)
    {
        await updateOfficeRequestValidator.ValidateAndThrowAsync(request);
        
        var office = await dataContext.Query<Core.Entities.Office>()
            .SingleOrDefaultAsync(x => x.Id == id);

        if (office is null)
        {
            throw new ClientException("Office not found");
        }

        office.Name = request.Name;
        office.FloorPlanJson = request.FloorPlanJson;
        
        await dataContext.Save();
    }
}