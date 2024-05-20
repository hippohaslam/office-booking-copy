namespace Hippo.Booking.Core.Entities;

public class Booking : BaseEntity<int>
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public int BookableObjectId { get; set; }
    public BookableObject BookableObject { get; set; } = null!;
    
    public DateTime StartTime { get; set; }
    
    public DateTime EndTime { get; set; }
}