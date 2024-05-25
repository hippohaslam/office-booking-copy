namespace Hippo.Booking.Core.Entities;

public class BaseEntity<TId>
{
    public TId Id { get; set; } = default!;
}