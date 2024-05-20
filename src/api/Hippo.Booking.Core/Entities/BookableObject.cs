namespace Hippo.Booking.Core.Entities;

public class BookableObject
{
    public string Name { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public int OfficeId { get; set; }
    public Office Office { get; set; } = null!;
}