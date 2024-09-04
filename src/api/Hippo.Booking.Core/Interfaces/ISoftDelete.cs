namespace Hippo.Booking.Core.Interfaces;

public interface ISoftDelete
{
    string? DeletedBy { get; set; }
    
    DateTime? DeletedAt { get; set; }
}