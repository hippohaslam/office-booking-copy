using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Queries.BookingWaitingList;

public class BookingWaitingListQueries(IDataContext dataContext) : IBookingWaitingListQueries
{
    public async Task<BookingWaitList?> GetNextOnWaitingListAsync(int areaId, DateOnly date)
    {
        var waitingList = await dataContext.Query<BookingWaitList>()
            .OrderBy(x => x.TimeQueued)
            .Where(x => x.AreaId == areaId && x.DateToBook == date)
            .ToListAsync();

        return waitingList.Count == 0 ?
            null : waitingList.First();
    }
    
    public async Task<BookingWaitListResponse?> FindUserInBookingWaitListAsync(string userId, int bookingWaitListId)
    {
        var result = await dataContext.Query<BookingWaitList>()
            .Where(x => x.Id == bookingWaitListId && x.UserId == userId)
            .Select(x => new BookingWaitListResponse
            {
                Id = x.Id,
                AreaId = x.AreaId,
                DateToBook = x.DateToBook,
                TimeQueued = x.TimeQueued
            })
            .FirstOrDefaultAsync();
        
        return result;
    }
}