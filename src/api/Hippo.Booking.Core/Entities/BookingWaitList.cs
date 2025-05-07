using Hippo.Booking.Core.Interfaces;

namespace Hippo.Booking.Core.Entities;

public class BookingWaitList : BaseEntity<int>, ISoftDelete
{
    public required string UserId { get; init; }
    
    public required int AreaId { get; init; }
    public Area Area { get; init; } = null!;
    
    public required DateOnly DateToBook { get; init; }
    
    public DateTime TimeQueued { get; init; } = DateTime.UtcNow;
    
    public string? DeletedBy { get; set; }
    
    public DateTime? DeletedAt { get; set; }
}