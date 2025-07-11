using Hippo.Booking.Core.Models;

namespace Hippo.Booking.Application.Queries.Users;

public interface IUserQueries
{
    Task<RegisteredUserModel?> GetUserById(string userId);

    Task<PagedList<UserListResponse>> GetUsers(int page, int pageSize);
}