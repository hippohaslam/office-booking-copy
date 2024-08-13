using Hippo.Booking.Core.Models;

namespace Hippo.Booking.Application.Commands.Users;

public interface IUpsertUserCommand
{
    Task<RegisteredUserModel> UpsertUser(RegisteredUserRequest registeredUserRequest);
}