using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Extensions;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Queries.Users;

public class UserQueries(IDataContext dataContext) : IUserQueries
{
    public Task<RegisteredUserModel?> GetUserById(string userId)
    {
        return dataContext.Query<User>()
            .Where(x => x.Id == userId)
            .Select(x => new RegisteredUserModel
            {
                FirstName = x.FirstName,
                LastName = x.LastName,
                Email = x.Email,
                UserId = x.Id,
                IsAdmin = x.IsAdmin
            })
            .SingleOrDefaultAsync();
    }

    public Task<PagedList<UserListResponse>> GetUsers(int page, int pageSize)
    {
        return dataContext.Query<User>()
            .Select(x => new UserListResponse
            {
                Id = x.Id,
                Email = x.Email,
                Name = x.FirstName + " " + x.LastName,
                IsAdmin = x.IsAdmin
            })
            .ToPagedListAsync(page, pageSize);
    }
}