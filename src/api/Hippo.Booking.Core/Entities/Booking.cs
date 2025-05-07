using Hippo.Booking.Core.Interfaces;

namespace Hippo.Booking.Core.Entities;

public class Booking : BaseEntity<int>, ICreatedBy, ISoftDelete
{
    public string UserId { get; set; } = string.Empty;
    public User User { get; set; } = null!;

    public int BookableObjectId { get; set; }
    public BookableObject BookableObject { get; set; } = null!;

    public bool IsConfirmed { get; set; }
    
    public string? LastSlackMessageId { get; set; }

    public DateOnly Date { get; set; }
    
    public DateTime CreatedAt { get; set; }

    public string CreatedBy { get; set; } = string.Empty;
    
    public string? DeletedBy { get; set; }
    
    public DateTime? DeletedAt { get; set; }
    
    public string? CalendarEventId { get; set; }
}