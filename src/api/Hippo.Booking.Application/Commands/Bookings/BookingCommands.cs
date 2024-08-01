using FluentValidation;
using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Commands.Bookings;

public class BookingCommands(
    IDataContext dataContext,
    IValidator<CreateBookingRequest> createBookingValidator,
    IValidator<DeleteBookingRequest> deleteBookingValidator) : ICreateBookingCommand, IDeleteBookingCommand
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

    public async Task Handle(DeleteBookingRequest request)
    {
        await deleteBookingValidator.ValidateAndThrowAsync(request);
        
        var booking = await dataContext.Query<Core.Entities.Booking>()
            .Include(i => i.BookableObject)
            .SingleOrDefaultAsync(x =>
                x.Id == request.BookingId &&
                x.BookableObject.AreaId == request.AreaId);

        if (booking != null)
        {
            if (!string.IsNullOrEmpty(request.UserId))
            {
                // if we do an admin check here, we can allow admins to delete any booking
                if (request.UserId != booking.UserId)
                {
                    throw new ClientForbiddenException();
                }
            }
            
            dataContext.DeleteEntity(booking);
            await dataContext.Save();   
        }
    }
}