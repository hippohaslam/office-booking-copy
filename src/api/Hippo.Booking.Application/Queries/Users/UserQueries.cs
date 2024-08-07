using Hippo.Booking.Core.Entities;
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
                UserId = x.Id
            })
            .SingleOrDefaultAsync();
    }
}