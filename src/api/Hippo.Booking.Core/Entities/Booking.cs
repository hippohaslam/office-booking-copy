namespace Hippo.Booking.Core.Entities;

public class Booking : BaseEntity<int>
{
    public string UserId { get; set; } = string.Empty;
    public User User { get; set; } = null!;

    public int BookableObjectId { get; set; }
    public BookableObject BookableObject { get; set; } = null!;
    
    public bool IsConfirmed { get; set; }

    public DateOnly Date { get; set; }
}