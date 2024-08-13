using Hippo.Booking.Core.Entities;

namespace Hippo.Booking.Core.Models;

public class RegisteredUserModel
{
    public string UserId { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string FullName => FirstName + " " + LastName;
    
    public bool IsAdmin { get; set; }
}