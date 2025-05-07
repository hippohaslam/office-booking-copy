namespace Hippo.Booking.Core.Entities;

public class BookingWaitList
{
    public int Id { get; init; }
    public required string UserId { get; init; }
    public required int AreaId { get; init; }
    public required DateOnly DateToBook { get; init; }
    public DateTime TimeQueued { get; init; } = DateTime.UtcNow;
    
    // EF navigation properties
    public Area Area { get; init; } = null!;
}