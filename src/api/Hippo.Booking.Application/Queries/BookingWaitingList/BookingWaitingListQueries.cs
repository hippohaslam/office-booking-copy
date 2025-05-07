using Hippo.Booking.Application.Models;
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
        var result = await dataContext.Query<BookingWaitList>(x => x.WithNoTracking())
            .Where(x => x.Id == bookingWaitListId && x.UserId == userId)
            .FirstOrDefaultAsync();
        
        if (result == null) {
            return null;
        }
        
        var location = await dataContext.Query<Location>(x => x.WithNoTracking())
            .Include(i => i.Areas)
            .FirstOrDefaultAsync(x => x.Areas.Any(a => a.Id == result.AreaId));
        
        if (location == null)
        {
            throw new InvalidOperationException("Location not found");
        }
        
        return new BookingWaitListResponse {
            Id = result.Id,
            Area = new IdName<int>(result.AreaId, location.Areas.First(a => a.Id == result.AreaId).Name),
            Location = new IdName<int>(location.Id, location.Name),
            DateToBook = result.DateToBook,
            TimeQueued = result.TimeQueued
        };
    }

    public async Task<BookingWaitListResponse[]> GetBookingWaitListForUserAsync(string userId)
    {
        var data = await dataContext.Query<BookingWaitList>(x => x.WithNoTracking())
            .Where(x => x.UserId == userId)
            .Include(x => x.Area)
            .ThenInclude(a => a.Location)
            .OrderBy(x => x.TimeQueued)
            .ToListAsync();
            
         
          return data.Select(x => new BookingWaitListResponse
         {
             Id = x.Id,
             Area = new IdName<int>(x.AreaId, x.Area.Name),
             Location = new IdName<int>(x.Area.Location.Id, x.Area.Location.Name),
             DateToBook = x.DateToBook,
             TimeQueued = x.TimeQueued
         }).ToArray();
    }

    public async Task<WaitingListAreaResponse> GetWaitingListForAreaAsync(string userId, int areaId, DateTime date)
    {
        var waitingList = await dataContext.Query<BookingWaitList>(x => x.WithNoTracking())
            .Where(x => x.AreaId == areaId && x.DateToBook == DateOnly.FromDateTime(date))
            .OrderBy(x => x.TimeQueued)
            .ToListAsync();

        if (waitingList.Count == 0)
        {
            return new WaitingListAreaResponse()
            {
                QueueLength = waitingList.Count,
                QueuePosition = null
            };
        }

        var userPosition = waitingList.FindIndex(x => x.UserId == userId);

        return new WaitingListAreaResponse
        {
            QueueLength = waitingList.Count,
            QueuePosition = userPosition == -1 ? null : userPosition + 1
        };
    }
}