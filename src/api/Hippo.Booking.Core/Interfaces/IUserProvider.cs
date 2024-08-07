using Hippo.Booking.Core.Models;

namespace Hippo.Booking.Core.Interfaces;

public interface IUserProvider
{
    RegisteredUserModel? GetCurrentUser();
}