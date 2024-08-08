using FluentValidation;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Commands.Users;

public class UserCommands(IDataContext dataContext, IValidator<RegisteredUserRequest> registeredUserRequestValidator) : IUpsertUserCommand
{
    public async Task UpsertUser(RegisteredUserRequest registeredUserRequest)
    {
        await registeredUserRequestValidator.ValidateAndThrowAsync(registeredUserRequest);

        var user = await dataContext.Query<User>()
            .SingleOrDefaultAsync(x => x.Id == registeredUserRequest.UserId);

        if (user == null)
        {
            user = new User
            {
                Id = registeredUserRequest.UserId,
                Email = registeredUserRequest.Email,
                FirstName = registeredUserRequest.FirstName,
                LastName = registeredUserRequest.LastName
            };

            dataContext.AddEntity(user);
        }
        else
        {
            user.Email = registeredUserRequest.Email;
            user.FirstName = registeredUserRequest.FirstName;
            user.LastName = registeredUserRequest.LastName;
        }

        await dataContext.Save();
    }
}