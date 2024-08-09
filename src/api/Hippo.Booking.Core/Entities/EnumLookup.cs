namespace Hippo.Booking.Core.Entities;

public class EnumLookup<T> : BaseEntity<T> where T : Enum
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}