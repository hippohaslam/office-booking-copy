namespace Hippo.Booking.Core.Entities;

public class BaseEntity<TId>
{
    public required TId Id { get; set; }
}