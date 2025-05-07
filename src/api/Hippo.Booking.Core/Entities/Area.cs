using Hippo.Booking.Core.Enums;
using Hippo.Booking.Core.Interfaces;

namespace Hippo.Booking.Core.Entities;

public class Area : BaseEntity<int>, ISoftDelete
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string FloorPlanJson { get; set; } = string.Empty;

    public int LocationId { get; set; }
    public Location Location { get; set; } = null!;

    public AreaTypeEnum AreaTypeId { get; set; }
    public AreaType AreaType { get; set; } = null!;

    public List<BookableObject> BookableObjects { get; set; } = new();
    
    public string? DeletedBy { get; set; }
    
    public DateTime? DeletedAt { get; set; }
}