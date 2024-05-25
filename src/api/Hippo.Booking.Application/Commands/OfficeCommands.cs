using Hippo.Booking.Application.Models;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Commands;

public class OfficeCommands(IDataContext dataContext) : IHandler<CreateOfficeRequest, int>
{
    public async Task<int> Handle(CreateOfficeRequest request)
    {
        var isExistingOffice = await dataContext
            .Query<Office>(x => x.WithNoTracking())
            .AnyAsync(x => x.Name == request.Name);
        
        if (isExistingOffice)
        {
            throw new ClientException("Office already exists");
        }

        var office = new Office
        {
            Name = request.Name
        };

        dataContext.Set<Office>().Add(office);

        await dataContext.Save();

        return office.Id;
    }
}