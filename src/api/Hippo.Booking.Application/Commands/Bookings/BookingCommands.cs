using FluentValidation;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Commands.Bookings;

public class BookingCommands(
    IDataContext dataContext,
    IValidator<CreateBookingRequest> createBookingValidator) : ICreateBookingCommand
{
    public async Task Handle(CreateBookingRequest request)
    {
        await createBookingValidator.ValidateAndThrowAsync(request);
        
        if (await dataContext.Query<Core.Entities.Booking>(x => x.WithNoTracking())
            .Include(i => i.BookableObject)
            .AnyAsync(x => 
                x.BookableObject.AreaId == request.AreaId &&
                x.Date == request.Date && 
                x.BookableObjectId == request.BookableObjectId))
        {
            throw new ClientException("Booking already exists");
        }
        
        var booking = new Core.Entities.Booking
        {
            BookableObjectId = request.BookableObjectId,
            Date = request.Date,
            UserId = request.UserId
        };
        
        dataContext.AddEntity(booking);

        await dataContext.Save();
    }
}