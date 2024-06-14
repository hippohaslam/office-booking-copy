namespace Hippo.Booking.Core.Entities;

public class Location : BaseEntity<int>
{
    public string Name { get; set; } = string.Empty;

    public string FloorPlanJson { get; set; } = string.Empty;

    public List<BookableObject> BookableObjects { get; set; } = new();
}