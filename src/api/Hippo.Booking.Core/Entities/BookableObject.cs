namespace Hippo.Booking.Core.Entities;

public class BookableObject : BaseEntity<int>
{
    public string Name { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public string FloorplanObjectId { get; set; } = string.Empty;
    
    public int LocationId { get; set; }
    public Location Location { get; set; } = null!;
    
    public List<Booking> Bookings { get; set; } = new();
}