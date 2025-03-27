using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Hippo.Booking.Application.Commands.BookingWaitList;

public class BookingWaitListCommands(
    IDataContext dataContext,
    IDateTimeProvider dateTimeProvider,
    ILogger<BookingWaitListCommands> logger) : ICreateBookingWaitListCommands, IDeleteBookingWaitListCommands
{
    public async Task<int> Handle(string userId, AddToWaitListRequest request)
    {
        var waitList = new Core.Entities.BookingWaitList
        {
            UserId = userId,
            AreaId = request.AreaId,
            DateToBook = request.Date,
            TimeQueued = dateTimeProvider.UtcNow
        };

        dataContext.AddEntity(waitList);

        await dataContext.Save();
            
        var entity = await dataContext.Query<Core.Entities.BookingWaitList>( x => x.WithNoTracking())
            .FirstOrDefaultAsync(x => x.UserId == userId && x.AreaId == request.AreaId && x.DateToBook == request.Date);
            
        return entity!.Id;
    }
    
    public async Task Handle(string userId, int waitListId)
    {
        var waitList = await dataContext.Query<Core.Entities.BookingWaitList>()
            .FirstOrDefaultAsync(x => x.Id == waitListId);

        if (waitList is null)
        {
            return;
        }

        if (waitList.UserId != userId)
        {
            throw new ClientForbiddenException();
        }

        dataContext.DeleteEntity(waitList);
        await dataContext.Save();
    }

    public async Task Handle()
    {
        var waitList = await dataContext.Query<Core.Entities.BookingWaitList>()
            .Where(x => x.DateToBook == dateTimeProvider.Today).ToListAsync();
        
        logger.LogInformation("Removing {Count} from waiting list", waitList.Count);

        dataContext.DeleteEntities(waitList);

        await dataContext.Save();
    }
}