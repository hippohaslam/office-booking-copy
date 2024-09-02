using Hippo.Booking.Core.Enums;

namespace Hippo.Booking.Core.Entities;

public class BookableObject : BaseEntity<int>
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string FloorplanObjectId { get; set; } = string.Empty;
    
    public BookableObjectTypeEnum BookableObjectTypeId { get; set; }
    public BookableObjectType BookableObjectType { get; set; } = null!;

    public int AreaId { get; set; }
    public Area Area { get; set; } = null!;

    public List<Booking> Bookings { get; set; } = new();
}