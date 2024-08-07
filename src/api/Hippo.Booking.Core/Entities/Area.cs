namespace Hippo.Booking.Core.Entities;

public class Area : BaseEntity<int>
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string FloorPlanJson { get; set; } = string.Empty;

    public int LocationId { get; set; }
    public Location Location { get; set; } = null!;

    public List<BookableObject> BookableObjects { get; set; } = new();
}