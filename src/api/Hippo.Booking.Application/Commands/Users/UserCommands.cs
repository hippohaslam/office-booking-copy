using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Commands.Users;

public class UserCommands(IDataContext dataContext) : IUpsertUserCommand
{
    public async Task UpsertUser(RegisteredUserDto registeredUserDto)
    {
        var user = await dataContext.Query<User>()
            .SingleOrDefaultAsync(x => x.Id == registeredUserDto.UserId);

        if (user == null)
        {
            user = new User
            {
                Id = registeredUserDto.UserId,
                Email = registeredUserDto.Email,
                Name = registeredUserDto.FullName,
                //TODO: Split first and last name out
            };

            dataContext.Set<User>().Add(user);
        }
        else
        {
            user.Email = registeredUserDto.Email;
            user.Name = registeredUserDto.FullName;
        }

        await dataContext.Save();
    }
}