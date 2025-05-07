using Hippo.Booking.Core.Entities;

namespace Hippo.Booking.Application.Queries.BookingWaitingList;

public interface IBookingWaitingListQueries
{
    Task<BookingWaitList?> GetNextOnWaitingListAsync(int areaId, DateOnly date);
    Task<BookingWaitListResponse?> FindUserInBookingWaitListAsync(string userId, int bookingWaitListId);
    Task<BookingWaitListResponse[]> GetBookingWaitListForUserAsync(string userId);
    Task<WaitingListAreaResponse> GetWaitingListForAreaAsync(string userId, int areaId, DateTime date);
}