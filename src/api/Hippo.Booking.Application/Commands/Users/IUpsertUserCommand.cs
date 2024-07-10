namespace Hippo.Booking.Application.Commands.Users;

public interface IUpsertUserCommand
{
    Task UpsertUser(RegisteredUserDto registeredUserDto);
}