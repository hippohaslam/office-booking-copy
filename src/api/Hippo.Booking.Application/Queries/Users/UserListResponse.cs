namespace Hippo.Booking.Application.Queries.Users;

public class UserListResponse
{
    public string Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
    
    public bool IsAdmin { get; set; }
}